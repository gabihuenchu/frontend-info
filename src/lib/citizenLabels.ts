import type { EstadoDonacion, EstadoNecesidad, PrioridadNecesidad } from '@/types/citizen';

export const prioridadLabel: Record<PrioridadNecesidad, string> = {
  CRITICO: 'Crítico',
  ALTO: 'Alto',
  MEDIO: 'Medio',
  BAJO: 'Bajo',
};

export const prioridadClass: Record<PrioridadNecesidad, string> = {
  CRITICO: 'citizen-badge citizen-badge--critico',
  ALTO: 'citizen-badge citizen-badge--alto',
  MEDIO: 'citizen-badge citizen-badge--medio',
  BAJO: 'citizen-badge citizen-badge--bajo',
};

export const estadoNecesidadLabel: Record<EstadoNecesidad, string> = {
  ACTIVA: 'Activa',
  PARCIALMENTE_CUBIERTA: 'Parcialmente cubierta',
  RESUELTA: 'Resuelta',
};

export const estadoDonacionLabel: Record<EstadoDonacion, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
};

export const estadoDonacionClass: Record<EstadoDonacion, string> = {
  PENDIENTE: 'citizen-badge citizen-badge--pendiente',
  CONFIRMADA: 'citizen-badge citizen-badge--confirmada',
  CANCELADA: 'citizen-badge citizen-badge--cancelada',
};

export function formatItemId(itemId: string): string {
  return `Ítem ${itemId.slice(0, 8).toUpperCase()}`;
}
