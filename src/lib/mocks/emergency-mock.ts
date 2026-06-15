import { Emergencia } from '@/types/emergency';

export const mockEmergencias: Emergencia[] = [
  {
    id: 'em-001',
    titulo: 'Incendio Forestal en Valparaíso',
    descripcion: 'Incendio de gran magnitud afecta sector alto de Viña del Mar y Valparaíso. Múltiples focos activos.',
    tipo: 'INCENDIO',
    severidad: 'CRITICA',
    estado: 'ACTIVA',
    region: 'Valparaíso',
    comuna: 'Viña del Mar',
    latitud: -33.0245,
    longitud: -71.5518,
    afectados: 1200,
    fechaCreacion: '2026-05-08T14:30:00Z',
    fechaUltimaActualizacion: '2026-05-09T10:15:00Z',
    usuarioCreador: 'SENAPRED',
  },
  {
    id: 'em-002',
    titulo: 'Desborde Río Mapocho',
    descripcion: 'Aumento inusual del caudal provocado por isoterma cero alta. Inundación en sectores precordilleranos.',
    tipo: 'INUNDACION',
    severidad: 'ALTA',
    estado: 'ACTIVA',
    region: 'Metropolitana',
    comuna: 'San José de Maipo',
    latitud: -33.6333,
    longitud: -70.3500,
    afectados: 350,
    fechaCreacion: '2026-05-09T02:00:00Z',
    fechaUltimaActualizacion: '2026-05-09T11:45:00Z',
    usuarioCreador: 'ONEMI Regional',
  },
  {
    id: 'em-003',
    titulo: 'Sismo 6.5 Richter en el Norte',
    descripcion: 'Sismo de mediana intensidad percibido en regiones de Tarapacá y Antofagasta. Sin riesgo de tsunami.',
    tipo: 'TERREMOTO',
    severidad: 'MEDIA',
    estado: 'CONTROLADA',
    region: 'Antofagasta',
    comuna: 'Tocopilla',
    latitud: -22.0945,
    longitud: -70.1989,
    afectados: 50,
    fechaCreacion: '2026-05-07T21:10:00Z',
    fechaUltimaActualizacion: '2026-05-08T09:00:00Z',
    usuarioCreador: 'CSN',
  },
  {
    id: 'em-004',
    titulo: 'Aluvión en Camino a Farellones',
    descripcion: 'Desprendimiento de tierra corta ruta principal G-21. Equipos de vialidad trabajando.',
    tipo: 'ALUVION',
    severidad: 'BAJA',
    estado: 'CONTROLADA',
    region: 'Metropolitana',
    comuna: 'Lo Barnechea',
    latitud: -33.3444,
    longitud: -70.3167,
    afectados: 0,
    fechaCreacion: '2026-05-05T08:20:00Z',
    fechaUltimaActualizacion: '2026-05-06T15:30:00Z',
    usuarioCreador: 'MOP',
  }
];

export const getKpis = () => {
  return {
    totalActivas: mockEmergencias.filter(e => e.estado === 'ACTIVA').length,
    totalCriticas: mockEmergencias.filter(e => e.severidad === 'CRITICA').length,
    totalAfectados: mockEmergencias.reduce((sum, e) => sum + (e.afectados || 0), 0),
    regionesMasAfectadas: Array.from(new Set(mockEmergencias.map(e => e.region)))
  };
};
