'use client';

import Link from 'next/link';
import '@/app/inicio.css';
import '@/styles/citizen.css';

interface CitizenShellProps {
  children: React.ReactNode;
}

const links = [
  { href: '/donaciones#como-donar', label: 'Cómo donar' },
  { href: '/donaciones#sucursales', label: 'Sucursales' },
  { href: '/donaciones#necesidades', label: 'Necesidades' },
];

export function CitizenShell({ children }: CitizenShellProps) {
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

          <nav className="citizen-nav" aria-label="Apoyo ciudadano">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="citizen-nav-link"
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
