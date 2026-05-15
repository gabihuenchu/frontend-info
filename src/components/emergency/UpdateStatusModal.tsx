'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { actualizarEstadoSchema, ActualizarEstadoFormData } from '@/lib/schemas/emergency';
import { Emergencia, ESTADO_LABELS, EstadoEmergencia } from '@/types/emergency';
import { X, AlertCircle } from 'lucide-react';
import './modal.css';

interface UpdateStatusModalProps {
  isOpen: boolean;
  isLoading: boolean;
  emergencia: Emergencia | null;
  onClose: () => void;
  onSubmit: (estado: EstadoEmergencia) => Promise<void>;
}

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  isLoading,
  emergencia,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ActualizarEstadoFormData>({
    resolver: zodResolver(actualizarEstadoSchema),
    defaultValues: {
      estado: emergencia?.estado || 'ACTIVA',
    },
  });

  const handleFormSubmit = async (data: ActualizarEstadoFormData) => {
    try {
      await onSubmit(data.estado);
      reset();
      onClose();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  if (!emergencia) return null;

  return (
    <>
      {isOpen && <div className="modal-overlay" onClick={onClose}></div>}

      <div className={`modal ${isOpen ? 'open' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>Actualizar Estado de Emergencia</h2>
            <button className="close-button" onClick={onClose} disabled={isSubmitting}>
              <X size={24} />
            </button>
          </div>

          <div className="modal-body">
            <div className="info-section">
              <h3>{emergencia.titulo}</h3>
              <p className="info-text">{emergencia.descripcion}</p>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="emergency-form">
              <div className="form-group">
                <label htmlFor="estado">Nuevo Estado *</label>
                <select
                  {...register('estado')}
                  id="estado"
                  className={`form-select ${errors.estado ? 'error' : ''}`}
                  disabled={isSubmitting || isLoading}
                >
                  <option value="">Seleccionar estado...</option>
                  {(Object.keys(ESTADO_LABELS) as EstadoEmergencia[]).map((estado) => (
                    <option key={estado} value={estado}>
                      {ESTADO_LABELS[estado]}
                    </option>
                  ))}
                </select>
                {errors.estado && (
                  <span className="error-message">
                    <AlertCircle size={16} /> {errors.estado.message}
                  </span>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                  disabled={isSubmitting || isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting || isLoading ? 'Actualizando...' : 'Actualizar Estado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateStatusModal;
