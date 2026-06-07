const KEY_TRANSFERENCIAS = 'catastrofescl_logistica_transferencias';
const KEY_MISIONES = 'catastrofescl_logistica_misiones';
const KEY_RUTAS = 'catastrofescl_logistica_rutas';

function readIds(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify([...new Set(ids)]));
}

export function getTransferenciaIds(): string[] {
  return readIds(KEY_TRANSFERENCIAS);
}

export function trackTransferenciaId(id: string) {
  writeIds(KEY_TRANSFERENCIAS, [...getTransferenciaIds(), id]);
}

export function getMisionIds(): string[] {
  return readIds(KEY_MISIONES);
}

export function trackMisionId(id: string) {
  writeIds(KEY_MISIONES, [...getMisionIds(), id]);
}

export function getRutaIds(): string[] {
  return readIds(KEY_RUTAS);
}

export function trackRutaId(id: string) {
  writeIds(KEY_RUTAS, [...getRutaIds(), id]);
}
