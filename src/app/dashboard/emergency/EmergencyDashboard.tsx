'use client';

import React, { useState, useCallback } from 'react';
import { useEmergenciasActivas, useCreateEmergencia, useUpdateEstadoEmergencia, useDeleteEmergencia, useEmergenciasKpis } from '@/hooks/useEmergencies';
import { Emergencia, EstadoEmergencia, SEVERIDAD_COLORS, ESTADO_LABELS } from '@/types/emergency';
import { CrearEmergenciaFormData } from '@/lib/schemas/emergency';
import { EmergencyMap } from '@/components/emergency/EmergencyMap';
import { EmergencyFormModal } from '@/components/emergency/EmergencyFormModal';
import { UpdateStatusModal } from '@/components/emergency/UpdateStatusModal';
import { Activity, AlertTriangle, MapPin, RefreshCw, AlertCircle, Edit, Trash2 } from 'lucide-react';
import './page.css';

// ==========================================
// Estados de Carga y Error
// ==========================================

const LoadingState = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Cargando emergencias...</p>
  </div>
);

const ErrorState = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <div className="error-container">
    <AlertCircle size={48} className="error-icon" />
    <h3>Error al cargar las emergencias</h3>
    <p>{error.message}</p>
    <button onClick={onRetry} className="btn-retry">
      <RefreshCw size={16} /> Reintentar
    </button>
  </div>
);

const EmptyState = () => (
  <div className="empty-container">
    <MapPin size={48} className="empty-icon" />
    <h3>No hay emergencias activas</h3>
    <p>No se encontraron emergencias en el sistema. Haz clic en el mapa para crear una.</p>
  </div>
);

// ==========================================
// Tabla de Emergencias
// ==========================================

interface EmergencyTableProps {
  emergencias: Emergencia[];
  selectedId?: string;
  onSelectEmergencia: (emergencia: Emergencia | null) => void;
  onEditStatus: (emergencia: Emergencia) => void;
  onDelete: (emergencia: Emergencia) => void;
  isDeleting: boolean;
}

const EmergencyTable: React.FC<EmergencyTableProps> = ({
  emergencias,
  selectedId,
  onSelectEmergencia,
  onEditStatus,
  onDelete,
  isDeleting,
}) => {
  return (
    <div className="table-container">
      <table className="emergency-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Tipo</th>
            <th>Región</th>
            <th>Severidad</th>
            <th>Estado</th>
            <th>Afectados</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {emergencias.map((emergencia) => (
            <tr
              key={emergencia.id}
              className={`table-row ${selectedId === emergencia.id ? 'selected' : ''}`}
              onClick={() => onSelectEmergencia(emergencia)}
            >
              <td className="title-cell">{emergencia.titulo}</td>
              <td>{emergencia.tipo}</td>
              <td>{emergencia.region}</td>
              <td>
                <span
                  className="severity-badge"
                  style={{ backgroundColor: SEVERIDAD_COLORS[emergencia.severidad] }}
                >
                  {emergencia.severidad}
                </span>
              </td>
              <td>
                <span className="status-badge">{ESTADO_LABELS[emergencia.estado]}</span>
              </td>
              <td className="numeric">{emergencia.afectados?.toLocaleString('es-CL') || '-'}</td>
              <td className="actions-cell">
                <button
                  className="btn-small btn-edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditStatus(emergencia);
                  }}
                  title="Editar estado"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="btn-small btn-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(emergencia);
                  }}
                  disabled={isDeleting}
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ==========================================
// KPIs Dashboard
// ==========================================

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, color }) => (
  <div className="kpi-card">
    <div className="kpi-icon" style={{ color }}>
      {icon}
    </div>
    <div className="kpi-content">
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">{value}</p>
    </div>
  </div>
);

// ==========================================
// Componente Principal: Emergency Dashboard
// ==========================================

export default function EmergencyDashboard() {
  // States
  const [selectedEmergencia, setSelectedEmergencia] = useState<Emergencia | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [prefilledCoords, setPrefilledCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Queries y Mutations
  const { data: emergencias = [], isLoading, error, refetch } = useEmergenciasActivas();
  const { data: kpis } = useEmergenciasKpis(emergencias);
  const createMutation = useCreateEmergencia();
  const updateMutation = useUpdateEstadoEmergencia();
  const deleteMutation = useDeleteEmergencia();

  // Handlers
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPrefilledCoords({ lat, lng });
    setShowCreateModal(true);
  }, []);

  const handleCreateEmergencia = useCallback(
    async (data: CrearEmergenciaFormData) => {
      try {
        await createMutation.mutateAsync(data);
        setShowCreateModal(false);
        setPrefilledCoords(null);
      } catch (error) {
        console.error('Error al crear emergencia:', error);
      }
    },
    [createMutation]
  );

  const handleUpdateStatus = useCallback(
    async (estado: EstadoEmergencia) => {
      if (!selectedEmergencia) return;
      try {
        await updateMutation.mutateAsync({
          id: selectedEmergencia.id,
          data: { estado },
        });
        setShowUpdateModal(false);
        setSelectedEmergencia(null);
      } catch (error) {
        console.error('Error al actualizar estado:', error);
      }
    },
    [selectedEmergencia, updateMutation]
  );

  const handleDeleteEmergencia = useCallback(
    async (emergencia: Emergencia) => {
      if (!confirm(`¿Estás seguro de que deseas eliminar la emergencia "${emergencia.titulo}"?`)) {
        return;
      }
      try {
        await deleteMutation.mutateAsync(emergencia.id);
        setSelectedEmergencia(null);
      } catch (error) {
        console.error('Error al eliminar emergencia:', error);
      }
    },
    [deleteMutation]
  );

  const handleEditStatus = useCallback((emergencia: Emergencia) => {
    setSelectedEmergencia(emergencia);
    setShowUpdateModal(true);
  }, []);

  const handleSelectEmergencia = useCallback((emergencia: Emergencia | null) => {
    setSelectedEmergencia(emergencia);
  }, []);

  // Render
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  if (emergencias.length === 0) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Dashboard de Emergencias</h1>
          <button
            className="btn-primary"
            onClick={() => {
              setPrefilledCoords(null);
              setShowCreateModal(true);
            }}
          >
            <AlertTriangle size={18} /> Crear Emergencia
          </button>
        </header>

        <EmergencyMap
          emergencias={[]}
          loading={isLoading}
          onMapClick={handleMapClick}
          selectedEmergencia={selectedEmergencia}
          onSelectEmergencia={handleSelectEmergencia}
        />

        <EmptyState />

        <EmergencyFormModal
          isOpen={showCreateModal}
          isLoading={createMutation.isPending}
          onClose={() => {
            setShowCreateModal(false);
            setPrefilledCoords(null);
          }}
          onSubmit={handleCreateEmergencia}
          prefilledLat={prefilledCoords?.lat}
          prefilledLng={prefilledCoords?.lng}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard de Emergencias</h1>
          <p className="header-subtitle">Gestión de emergencias en tiempo real</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setPrefilledCoords(null);
            setShowCreateModal(true);
          }}
        >
          <AlertTriangle size={18} /> Crear Emergencia
        </button>
      </header>

      {/* KPIs */}
      {kpis && (
        <div className="kpis-grid">
          <KpiCard
            icon={<Activity size={24} />}
            label="Emergencias Activas"
            value={kpis.totalActivas}
            color="#2196f3"
          />
          <KpiCard
            icon={<AlertTriangle size={24} />}
            label="Críticas"
            value={kpis.totalCriticas}
            color="#d32f2f"
          />
          <KpiCard
            icon={<MapPin size={24} />}
            label="Afectados"
            value={kpis.totalAfectados.toLocaleString('es-CL')}
            color="#ff9800"
          />
          <KpiCard
            icon={<RefreshCw size={24} />}
            label="Regiones"
            value={kpis.regionesMasAfectadas.length}
            color="#4caf50"
          />
        </div>
      )}

      {/* Mapa */}
      <section className="map-section">
        <h2>Ubicación de Emergencias</h2>
        <EmergencyMap
          emergencias={emergencias}
          loading={isLoading}
          onMapClick={handleMapClick}
          selectedEmergencia={selectedEmergencia}
          onSelectEmergencia={handleSelectEmergencia}
        />
      </section>

      {/* Tabla */}
      <section className="table-section">
        <h2>Listado de Emergencias</h2>
        <EmergencyTable
          emergencias={emergencias}
          selectedId={selectedEmergencia?.id}
          onSelectEmergencia={handleSelectEmergencia}
          onEditStatus={handleEditStatus}
          onDelete={handleDeleteEmergencia}
          isDeleting={deleteMutation.isPending}
        />
      </section>

      {/* Modales */}
      <EmergencyFormModal
        isOpen={showCreateModal}
        isLoading={createMutation.isPending}
        onClose={() => {
          setShowCreateModal(false);
          setPrefilledCoords(null);
        }}
        onSubmit={handleCreateEmergencia}
        prefilledLat={prefilledCoords?.lat}
        prefilledLng={prefilledCoords?.lng}
      />

      <UpdateStatusModal
        isOpen={showUpdateModal}
        isLoading={updateMutation.isPending}
        emergencia={selectedEmergencia}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdateStatus}
      />
    </div>
  );
}
