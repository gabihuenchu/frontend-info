import type { Metadata } from 'next';
import PaginaDonacionesCiudadana from './PaginaDonacionesCiudadana';

export const metadata: Metadata = {
  title: 'Donaciones — Participación ciudadana | CatástrofesCL',
  description: 'Registro de donaciones por categoría para centros de acopio',
};

export default function DashboardDonacionesPage() {
  return <PaginaDonacionesCiudadana />;
}
