'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { crearEmergenciaSchema, CrearEmergenciaFormData } from '@/lib/schemas/emergency';
import {
  TipoEmergencia,
  NivelSeveridad,
  TIPO_EMERGENCIA_LABELS,
  SEVERIDAD_LABELS,
  REGIONS_CHILE,
} from '@/types/emergency';
import { X, AlertCircle } from 'lucide-react';
import './modal.css';

interface EmergencyFormModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: CrearEmergenciaFormData) => Promise<void>;
  prefilledLat?: number;
  prefilledLng?: number;
}

export const EmergencyFormModal: React.FC<EmergencyFormModalProps> = ({
  isOpen,
  isLoading,
  onClose,
  onSubmit,
  prefilledLat,
  prefilledLng,
}) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<CrearEmergenciaFormData>({
    resolver: zodResolver(crearEmergenciaSchema),
    defaultValues: {
      latitud: prefilledLat || -33.4489,
      longitud: prefilledLng || -70.6693,
    },
  });

  const region = watch('region');

  const handleFormSubmit = async (data: CrearEmergenciaFormData) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error al crear emergencia:', error);
    }
  };

  const regionData = Object.entries(REGIONS_CHILE);

  return (
    <>
      {isOpen && <div className="modal-overlay" onClick={onClose}></div>}

      <div className={`modal ${isOpen ? 'open' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>Crear Nueva Emergencia</h2>
            <button className="close-button" onClick={onClose} disabled={isSubmitting}>
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="emergency-form">
            {/* Título */}
            <div className="form-group">
              <label htmlFor="titulo">Título de la Emergencia *</label>
              <input
                {...register('titulo')}
                id="titulo"
                type="text"
                placeholder="Ej: Terremoto en la región de..."
                className={`form-input ${errors.titulo ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.titulo && (
                <span className="error-message">
                  <AlertCircle size={16} /> {errors.titulo.message}
                </span>
              )}
            </div>

            {/* Descripción */}
            <div className="form-group">
              <label htmlFor="descripcion">Descripción Detallada *</label>
              <textarea
                {...register('descripcion')}
                id="descripcion"
                placeholder="Describe la emergencia, causas, impacto inicial, etc."
                rows={4}
                className={`form-textarea ${errors.descripcion ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.descripcion && (
                <span className="error-message">
                  <AlertCircle size={16} /> {errors.descripcion.message}
                </span>
              )}
            </div>

            {/* Tipo y Severidad en fila */}
            <div className="form-row">
              {/* Tipo */}
              <div className="form-group">
                <label htmlFor="tipo">Tipo de Emergencia *</label>
                <select
                  {...register('tipo')}
                  id="tipo"
                  className={`form-select ${errors.tipo ? 'error' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value="">Seleccionar tipo...</option>
                  {(Object.keys(TIPO_EMERGENCIA_LABELS) as TipoEmergencia[]).map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {TIPO_EMERGENCIA_LABELS[tipo]}
                    </option>
                  ))}
                </select>
                {errors.tipo && (
                  <span className="error-message">
                    <AlertCircle size={16} /> {errors.tipo.message}
                  </span>
                )}
              </div>

              {/* Severidad */}
              <div className="form-group">
                <label htmlFor="severidad">Nivel de Severidad *</label>
                <select
                  {...register('severidad')}
                  id="severidad"
                  className={`form-select ${errors.severidad ? 'error' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value="">Seleccionar severidad...</option>
                  {(Object.keys(SEVERIDAD_LABELS) as NivelSeveridad[]).map((nivel) => (
                    <option key={nivel} value={nivel}>
                      {SEVERIDAD_LABELS[nivel]}
                    </option>
                  ))}
                </select>
                {errors.severidad && (
                  <span className="error-message">
                    <AlertCircle size={16} /> {errors.severidad.message}
                  </span>
                )}
              </div>
            </div>

            {/* Región y Comuna */}
            <div className="form-row">
              {/* Región */}
              <div className="form-group">
                <label htmlFor="region">Región *</label>
                <select
                  {...register('region')}
                  id="region"
                  className={`form-select ${errors.region ? 'error' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value="">Seleccionar región...</option>
                  {regionData.map(([name]) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                {errors.region && (
                  <span className="error-message">
                    <AlertCircle size={16} /> {errors.region.message}
                  </span>
                )}
              </div>

              {/* Comuna */}
              <div className="form-group">
                <label htmlFor="comuna">Comuna *</label>
                <input
                  {...register('comuna')}
                  id="comuna"
                  type="text"
                  placeholder="Ej: Santiago, Valparaíso..."
                  className={`form-input ${errors.comuna ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.comuna && (
                  <span className="error-message">
                    <AlertCircle size={16} /> {errors.comuna.message}
                  </span>
                )}
              </div>
            </div>

            {/* Coordenadas */}
            <div className="form-row">
              {/* Latitud */}
              <div className="form-group">
                <label htmlFor="latitud">Latitud *</label>
                <input
                  {...register('latitud', { valueAsNumber: true })}
                  id="latitud"
                  type="number"
                  step="0.0001"
                  placeholder="-33.4489"
                  className={`form-input ${errors.latitud ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.latitud && (
                  <span className="error-message">
                    <AlertCircle size={16} /> {errors.latitud.message}
                  </span>
                )}
              </div>

              {/* Longitud */}
              <div className="form-group">
                <label htmlFor="longitud">Longitud *</label>
                <input
                  {...register('longitud', { valueAsNumber: true })}
                  id="longitud"
                  type="number"
                  step="0.0001"
                  placeholder="-70.6693"
                  className={`form-input ${errors.longitud ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.longitud && (
                  <span className="error-message">
                    <AlertCircle size={16} /> {errors.longitud.message}
                  </span>
                )}
              </div>
            </div>

            {/* Afectados (opcional) */}
            <div className="form-group">
              <label htmlFor="afectados">Número de Afectados (opcional)</label>
              <input
                {...register('afectados', { valueAsNumber: true })}
                id="afectados"
                type="number"
                placeholder="0"
                min="0"
                className={`form-input ${errors.afectados ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.afectados && (
                <span className="error-message">
                  <AlertCircle size={16} /> {errors.afectados.message}
                </span>
              )}
            </div>

            {/* Botones */}
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
                {isSubmitting || isLoading ? 'Creando...' : 'Crear Emergencia'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EmergencyFormModal;
