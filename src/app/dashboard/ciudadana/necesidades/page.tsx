import type { Metadata } from 'next';
import PaginaNecesidadesCiudadana from './PaginaNecesidadesCiudadana';

export const metadata: Metadata = {
  title: 'Necesidades — Participación ciudadana | CatástrofesCL',
  description: 'Gestión de necesidades de recursos en centros de acopio',
};

export default function DashboardNecesidadesPage() {
  return <PaginaNecesidadesCiudadana />;
}
