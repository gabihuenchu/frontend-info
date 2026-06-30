'use client';

import { useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useCrearCentro } from '@/hooks/useResources';
import { useCatastrofesGoogleMaps, useGoogleMapsApiKey } from '@/hooks/useGoogleMaps';
import { googleMapDarkStyles } from '@/lib/mapStyles';
import { useDashboardTheme } from '@/providers/DashboardThemeProvider';
import { formatApiError } from '@/lib/api-errors';
import { crearCentroSchema } from '@/lib/schemas/centro';

const centroDefault = { lat: -33.45, lng: -70.67 };

interface CrearCentroDialogProps {
  emergenciaId?: string;
  onClose: () => void;
  onCreado: () => void;
}

export default function CrearCentroDialog({ onClose, onCreado }: CrearCentroDialogProps) {
  const { dark } = useDashboardTheme();
  const apiKey = useGoogleMapsApiKey();
  const { isLoaded } = useCatastrofesGoogleMaps(apiKey);
  const crear = useCrearCentro();

  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    region: '',
    comuna: '',
    capacidad: '',
    horario: '',
  });
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      toast.error('Coloca el centro en el mapa (clic) o ingresa coordenadas');
      return;
    }
    const parsed = crearCentroSchema.safeParse({
      nombre: form.nombre,
      direccion: form.direccion || undefined,
      region: form.region || undefined,
      comuna: form.comuna || undefined,
      capacidad: form.capacidad ? Number(form.capacidad) : undefined,
      horario: form.horario || undefined,
      latitud: pin.lat,
      longitud: pin.lng,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Datos inválidos');
      return;
    }
    try {
      await crear.mutateAsync({
        nombre: parsed.data.nombre,
        direccion: parsed.data.direccion || undefined,
        region: parsed.data.region || undefined,
        comuna: parsed.data.comuna || undefined,
        capacidad: parsed.data.capacidad,
        horario: parsed.data.horario || undefined,
        coordenadas: { longitud: pin.lng, latitud: pin.lat },
      });
      toast.success('Centro creado. Su inventario se inicializa en 0.');
      onCreado();
      onClose();
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="logistics-panel"
        style={{ width: 'min(720px, 100%)', maxHeight: '90vh', overflowY: 'auto', padding: '1.25rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Crear centro de acopio</h3>
          <button type="button" className="logistics-btn logistics-btn--secondary logistics-btn--sm" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <form className="logistics-form logistics-form--wide" onSubmit={handleSubmit}>
          <label>
            Nombre *
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </label>
          <label>
            Dirección
            <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <label style={{ flex: 1 }}>
              Región
              <input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
            </label>
            <label style={{ flex: 1 }}>
              Comuna
              <input value={form.comuna} onChange={(e) => setForm({ ...form, comuna: e.target.value })} />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <label style={{ flex: 1 }}>
              Capacidad
              <input
                type="number"
                min={1}
                value={form.capacidad}
                onChange={(e) => setForm({ ...form, capacidad: e.target.value })}
              />
            </label>
            <label style={{ flex: 1 }}>
              Horario
              <input value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} />
            </label>
          </div>

          <label>
            Ubicación (clic en el mapa para colocar el pin)
            <span className="logistics-hint" style={{ marginTop: 4 }}>
              {pin ? `Lat ${pin.lat.toFixed(5)} · Lng ${pin.lng.toFixed(5)}` : 'Sin ubicación seleccionada'}
            </span>
          </label>
          <div style={{ height: 260, borderRadius: 10, overflow: 'hidden' }}>
            {apiKey && isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={pin ?? centroDefault}
                zoom={pin ? 12 : 5}
                options={{
                  disableDefaultUI: true,
                  draggableCursor: 'crosshair',
                  styles: dark ? googleMapDarkStyles : [],
                }}
                onClick={(e) => {
                  if (e.latLng) setPin({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                }}
              >
                {pin && (
                  <Marker
                    position={pin}
                    draggable
                    onDragEnd={(e) => {
                      if (e.latLng) setPin({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                    }}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 10,
                      fillColor: '#0d9488',
                      fillOpacity: 1,
                      strokeColor: '#fff',
                      strokeWeight: 2,
                    }}
                  />
                )}
              </GoogleMap>
            ) : (
              <div className="logistics-empty">Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para el mapa.</div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="logistics-btn logistics-btn--secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="logistics-btn logistics-btn--primary" disabled={crear.isPending}>
              {crear.isPending ? 'Creando…' : 'Crear centro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
