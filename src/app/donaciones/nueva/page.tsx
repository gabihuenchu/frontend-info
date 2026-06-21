import { redirect } from 'next/navigation';

/** El registro de donaciones en plataforma es solo para operadores (dashboard). */
export default function NuevaDonacionRedirectPage() {
  redirect('/donaciones');
}
