import type { Metadata } from 'next';
import './inicio.css';

export const metadata: Metadata = {
  title: 'CatástrofesCL — Sistema Nacional de Coordinación y Monitoreo',
  description:
    'Plataforma nacional de coordinación, monitoreo y gestión de recursos humanitarios para catástrofes naturales en Chile. Conectamos ciudadanos, autoridades y voluntarios.',
  keywords: 'catástrofes, Chile, emergencias, monitoreo, donaciones, centros de acopio',
  openGraph: {
    title: 'CatástrofesCL — Sistema Nacional de Monitoreo',
    description: 'Coordinación y gestión de recursos humanitarios para catástrofes en Chile.',
    locale: 'es_CL',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
