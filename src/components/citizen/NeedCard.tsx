'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Necesidad } from '@/types/citizen';
import {
  formatItemId,
  prioridadClass,
  prioridadLabel,
  estadoNecesidadLabel,
} from '@/lib/citizenLabels';

interface NeedCardProps {
  need: Necesidad;
}

export function NeedCard({ need }: NeedCardProps) {
  const fecha = need.creadaEn
    ? format(new Date(need.creadaEn), "d MMM yyyy", { locale: es })
    : null;

  return (
    <article className="citizen-card">
      <div className="citizen-card-header">
        <h3 className="citizen-card-title">{formatItemId(need.itemId)}</h3>
        <span className={prioridadClass[need.prioridad]}>{prioridadLabel[need.prioridad]}</span>
      </div>

      <div className="citizen-card-meta">
        <p>Cantidad necesaria: <strong>{need.cantidadNecesaria}</strong></p>
        {typeof need.cantidadRestante === 'number' && (
          <p>
            Aún se aceptan: <strong>{need.cantidadRestante}</strong>
            {typeof need.cantidadComprometida === 'number' && need.cantidadComprometida > 0 && (
              <> ({need.cantidadComprometida} ya comprometidas)</>
            )}
          </p>
        )}
        <p>Estado: {estadoNecesidadLabel[need.estado]}</p>
        <p>Centro: {need.centroId.slice(0, 8).toUpperCase()}…</p>
        {fecha && <p>Registrada: {fecha}</p>}
      </div>
    </article>
  );
}
