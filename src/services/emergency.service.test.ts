import { describe, it, expect } from 'vitest';
import {
  idCorto,
  etiquetaEmergencia,
  resolverEmergencia,
  etiquetaEmergenciaPorId,
  mapTipoUiABackend,
  severidadUiAApi,
  cerrarAnilloZona,
  centroidEpicentro,
  prepararZonaImpactoParaApi,
  latLngRingFromGeoJson,
  mapEmergenciaResponse,
  calculateKpis,
  isCentrosAcopioApiEnabled,
  type Emergencia,
  type EmergenciaResponseDto,
  type CoordenadaDto,
} from './emergency.service';

describe('idCorto', () => {
  it('toma los primeros 8 caracteres', () => {
    expect(idCorto('a1b2c3d4e5f6')).toBe('a1b2c3d4');
  });

  it('devuelve cadena vacía para null/undefined', () => {
    expect(idCorto(null)).toBe('');
    expect(idCorto(undefined)).toBe('');
  });
});

describe('etiquetaEmergencia', () => {
  it('compone tipo, región y código corto', () => {
    const e: Pick<Emergencia, 'id' | 'tipo' | 'region'> = {
      id: 'a1b2c3d4xxxx',
      tipo: 'INCENDIO',
      region: 'Biobío',
    };
    expect(etiquetaEmergencia(e)).toBe('Incendio · Biobío (#a1b2c3d4)');
  });

  it('omite la región cuando no existe', () => {
    expect(etiquetaEmergencia({ id: 'a1b2c3d4', tipo: 'TSUNAMI', region: '' })).toBe(
      'Tsunami (#a1b2c3d4)'
    );
  });

  it('devuelve cadena vacía cuando no hay emergencia', () => {
    expect(etiquetaEmergencia(null)).toBe('');
  });
});

describe('resolverEmergencia / etiquetaEmergenciaPorId', () => {
  const lista: Emergencia[] = [
    {
      id: 'e1',
      titulo: 'Biobío',
      descripcion: '',
      tipo: 'INCENDIO',
      severidad: 'ALTA',
      estado: 'ACTIVA',
      region: 'Biobío',
      latitud: 0,
      longitud: 0,
    },
  ];

  it('resuelve una emergencia existente', () => {
    expect(resolverEmergencia('e1', lista)?.id).toBe('e1');
  });

  it('devuelve null cuando no existe o falta id/lista', () => {
    expect(resolverEmergencia('zzz', lista)).toBeNull();
    expect(resolverEmergencia(null, lista)).toBeNull();
    expect(resolverEmergencia('e1', undefined)).toBeNull();
  });

  it('etiquetaEmergenciaPorId usa la etiqueta completa si está en la lista', () => {
    expect(etiquetaEmergenciaPorId('e1', lista)).toContain('Incendio');
  });

  it('etiquetaEmergenciaPorId usa código corto si no está en la lista', () => {
    expect(etiquetaEmergenciaPorId('abcd1234zzzz', lista)).toBe('Emergencia #abcd1234');
  });

  it('etiquetaEmergenciaPorId devuelve null sin id', () => {
    expect(etiquetaEmergenciaPorId(null, lista)).toBeNull();
  });
});

describe('mapTipoUiABackend', () => {
  it('mapea valores directos del enum', () => {
    expect(mapTipoUiABackend('TERREMOTO')).toBe('TERREMOTO');
  });

  it('mapea alias y nombres legibles', () => {
    expect(mapTipoUiABackend('ERUPCION_VOLCANICA')).toBe('ERUPCION');
    expect(mapTipoUiABackend('SISMO')).toBe('TERREMOTO');
    expect(mapTipoUiABackend('Incendios Forestales')).toBe('INCENDIO');
  });

  it('usa INCENDIO como valor por defecto para desconocidos', () => {
    expect(mapTipoUiABackend('DESCONOCIDO')).toBe('INCENDIO');
  });
});

describe('severidadUiAApi', () => {
  it('convierte CRITICA en CATASTROFICA', () => {
    expect(severidadUiAApi('CRITICA')).toBe('CATASTROFICA');
  });

  it('mantiene las demás severidades', () => {
    expect(severidadUiAApi('ALTA')).toBe('ALTA');
    expect(severidadUiAApi('MEDIA')).toBe('MEDIA');
  });
});

describe('geometría de la zona de impacto', () => {
  const cuadrado: CoordenadaDto[] = [
    { longitud: -70, latitud: -33 },
    { longitud: -71, latitud: -33 },
    { longitud: -71, latitud: -34 },
  ];

  it('cerrarAnilloZona cierra el anillo repitiendo el primer punto', () => {
    const anillo = cerrarAnilloZona(cuadrado);
    expect(anillo).toHaveLength(4);
    expect(anillo[0]).toEqual(anillo[anillo.length - 1]);
  });

  it('cerrarAnilloZona no duplica si ya está cerrado', () => {
    const yaCerrado = [...cuadrado, { ...cuadrado[0] }];
    expect(cerrarAnilloZona(yaCerrado)).toHaveLength(4);
  });

  it('cerrarAnilloZona maneja arreglo vacío', () => {
    expect(cerrarAnilloZona([])).toEqual([]);
  });

  it('centroidEpicentro calcula el promedio ignorando el cierre', () => {
    const anillo = cerrarAnilloZona(cuadrado);
    const centroide = centroidEpicentro(anillo);
    expect(centroide.longitud).toBeCloseTo((-70 + -71 + -71) / 3);
    expect(centroide.latitud).toBeCloseTo((-33 + -33 + -34) / 3);
  });

  it('prepararZonaImpactoParaApi devuelve null con menos de 3 vértices', () => {
    expect(prepararZonaImpactoParaApi(cuadrado.slice(0, 2))).toBeNull();
  });

  it('prepararZonaImpactoParaApi devuelve anillo cerrado y epicentro', () => {
    const resultado = prepararZonaImpactoParaApi(cuadrado);
    expect(resultado).not.toBeNull();
    expect(resultado!.ring).toHaveLength(4);
    expect(resultado!.epicentro).toHaveProperty('longitud');
  });

  it('latLngRingFromGeoJson convierte [lng,lat] a {lat,lng}', () => {
    const ring = latLngRingFromGeoJson({
      type: 'Polygon',
      coordinates: [[[-70, -33], [-71, -33], [-71, -34], [-70, -33]]],
    });
    expect(ring[0]).toEqual({ lat: -33, lng: -70 });
  });

  it('latLngRingFromGeoJson devuelve [] para polígono nulo', () => {
    expect(latLngRingFromGeoJson(null)).toEqual([]);
  });
});

describe('mapEmergenciaResponse', () => {
  it('mapea el DTO del backend al modelo de UI', () => {
    const dto: EmergenciaResponseDto = {
      id: 'e1',
      tipo: 'TERREMOTO',
      severidad: 'CATASTROFICA',
      region: 'Maule',
      estado: 'ACTIVA',
      coordenadasEpicentro: { type: 'Point', coordinates: [-72, -35] },
      zonaImpacto: null,
      declaradaPorUsuarioId: 'u1',
      declaradaEn: '2026-01-01T00:00:00Z',
      actualizadaEn: '2026-01-02T00:00:00Z',
    };

    const ui = mapEmergenciaResponse(dto);

    expect(ui.id).toBe('e1');
    expect(ui.region).toBe('Maule');
    expect(ui.severidad).toBe('CRITICA');
    expect(ui.longitud).toBe(-72);
    expect(ui.latitud).toBe(-35);
  });
});

describe('calculateKpis', () => {
  const emergencias: Emergencia[] = [
    { id: '1', titulo: '', descripcion: '', tipo: 'INCENDIO', severidad: 'ALTA', estado: 'ACTIVA', region: 'Biobío', latitud: 0, longitud: 0, afectados: 100 },
    { id: '2', titulo: '', descripcion: '', tipo: 'TSUNAMI', severidad: 'CRITICA', estado: 'ACTIVA', region: 'Valparaíso', latitud: 0, longitud: 0, personasAfectadas: 50 },
    { id: '3', titulo: '', descripcion: '', tipo: 'INUNDACION', severidad: 'BAJA', estado: 'CONTROLADA', region: 'Biobío', latitud: 0, longitud: 0 },
  ];

  it('cuenta activas, críticas/altas, suma afectados y regiones únicas', () => {
    const kpis = calculateKpis(emergencias);
    expect(kpis.totalActivas).toBe(2);
    expect(kpis.totalCriticas).toBe(2);
    expect(kpis.totalAfectados).toBe(150);
    expect(kpis.regionesMasAfectadas).toEqual(['Biobío', 'Valparaíso']);
  });

  it('devuelve ceros para una lista vacía', () => {
    expect(calculateKpis([])).toEqual({
      totalActivas: 0,
      totalCriticas: 0,
      totalAfectados: 0,
      regionesMasAfectadas: [],
    });
  });
});

describe('isCentrosAcopioApiEnabled', () => {
  it('está habilitado por defecto (sin variable de entorno)', () => {
    expect(isCentrosAcopioApiEnabled()).toBe(true);
  });
});
