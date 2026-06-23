import type { Metadata } from 'next';
import PaginaCentrosAcopio from './PaginaCentrosAcopio';

export const metadata: Metadata = {
  title: 'Centros de Acopio | CatástrofesCL',
  description: 'Gestión de centros de acopio, inventario por ítem, umbrales de criticidad y operadores.',
};

export default function CentrosAcopioPage() {
  return <PaginaCentrosAcopio />;
}
