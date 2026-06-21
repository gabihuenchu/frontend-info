import { redirect } from 'next/navigation';

/** Historial de contribuciones: flujo reservado al panel de gestión autenticado. */
export default function MisContribucionesRedirectPage() {
  redirect('/donaciones');
}
