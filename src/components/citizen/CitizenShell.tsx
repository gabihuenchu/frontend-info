'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '@/app/inicio.css';
import '@/styles/citizen.css';

interface CitizenShellProps {
  children: React.ReactNode;
}

const links = [
  { href: '/donaciones', label: 'Necesidades' },
  { href: '/donaciones#formulario-donacion', label: 'Donar' },
  { href: '/donaciones/mis-contribuciones', label: 'Mis contribuciones' },
];

export function CitizenShell({ children }: CitizenShellProps) {
  const pathname = usePathname();

  return (
    <div className="citizen-page">
      <header className="citizen-header" role="banner">
        <div className="citizen-header-inner">
          <Link href="/" className="logo" aria-label="CatástrofesCL — Inicio">
            <span className="logo-text" aria-hidden="true">
              CATÁSTROFES
            </span>
            <span className="logo-badge" aria-hidden="true">
              CL
            </span>
          </Link>

          <nav className="citizen-nav" aria-label="Participación ciudadana">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`citizen-nav-link${pathname === link.href ? ' active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="citizen-main">{children}</main>
    </div>
  );
}
