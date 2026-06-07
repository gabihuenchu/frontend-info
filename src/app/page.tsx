'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAnuncios } from '@/hooks/useEmergencies';
import { MapPin, Clock, AlertTriangle, Bell, Loader2 } from 'lucide-react';
import './inicio.css';

/* ── Iconos SVG inline (sin dependencias extra) ── */
const IconCoordination = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M16 4L4 10V22L16 28L28 22V10L16 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M16 4V28M4 10L16 16L28 10" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
);

const IconMonitoring = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M16 10V16L20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
    <path d="M16 5V3M16 29V27M5 16H3M29 16H27" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IconResources = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect x="4" y="14" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
    <rect x="18" y="8" width="10" height="20" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M4 10L16 4L28 8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
);

const IconCitizen = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="12" cy="10" r="4" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M4 26C4 22.134 7.582 19 12 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="22" cy="18" r="3" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M16 28C16 25.239 18.686 23 22 23C25.314 23 28 25.239 28 28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IconChile = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M16 4C9.373 4 4 9.373 4 16C4 22.627 9.373 28 16 28C22.627 28 28 22.627 28 16C28 9.373 22.627 4 16 4Z" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M10 16H22M16 10V22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M12 12L20 20M20 12L12 20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
  </svg>
);

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2L14.928 14H1.072L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M8 7V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="8" cy="12" r="0.75" fill="currentColor"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M3 6H19M3 11H19M3 16H19" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M5 5L17 17M17 5L5 17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
  </svg>
);

/* ── Datos de beneficios ── */
const benefits = [
  {
    id: 'coordinacion',
    icon: <IconCoordination />,
    title: 'Coordinación\nEfectiva',
    subtitle: 'Respuesta articulada entre autoridades, operadores y ciudadanos',
  },
  {
    id: 'monitoreo',
    icon: <IconMonitoring />,
    title: 'Monitoreo\n24/7',
    subtitle: 'Alertas y estado de emergencias en tiempo real',
  },
  {
    id: 'recursos',
    icon: <IconResources />,
    title: 'Gestión de\nRecursos',
    subtitle: 'Control de inventario y centros de acopio automatizado',
  },
  {
    id: 'ciudadano',
    icon: <IconCitizen />,
    title: 'Apoyo\nCiudadano',
    subtitle: 'Canal directo para donar, reportar necesidades y voluntariado',
  },
  {
    id: 'chile',
    icon: <IconChile />,
    title: 'Chile\nUnido',
    subtitle: 'Una sola plataforma para todo el territorio nacional',
  },
];

/* ── Nav links ── */
const navLinks = [
  { label: 'Inicio', href: '#' },
  { label: 'Quiénes Somos', href: '#quienes-somos' },
  { label: 'Alertas', href: '#alertas' },
  { label: 'Centros de Acopio', href: '#centros' },
  { label: 'Donaciones', href: '#donaciones' },
];

/* ════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ════════════════════════════════════════ */
export default function Home() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroBgLoaded, setHeroBgLoaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // ── Alertas en Tiempo Real (Polling 5s) ──
  const { data: anunciosData, isLoading: anunciosCargando } = useAnuncios();
  const anuncios = (anunciosData?.content || []).slice(0, 6); // Mostrar top 6

  /* Scroll → header opaco */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Cerrar menú al resize */
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* Animación parallax sutil al cargar */
  useEffect(() => {
    const timer = setTimeout(() => setHeroBgLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => router.push('/login');

  return (
    <>
      {/* ─────────────────────────
          HEADER FIJO CON BLUR
          ───────────────────────── */}
      <header
        id="site-header"
        className={`site-header${scrolled ? ' scrolled' : ''}`}
        role="banner"
      >
        <div className="header-inner">
          {/* Logo */}
          <a href="/" className="logo" aria-label="CatástrofesCL — Inicio">
            <span className="logo-text" aria-hidden="true">CATÁSTROFES</span>
            <span className="logo-badge" aria-hidden="true">CL</span>
          </a>

          {/* Nav desktop */}
          <nav className="nav" aria-label="Navegación principal">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="nav-link">
                {link.label}
              </a>
            ))}
            <button
              id="btn-header-acceder"
              className="btn-nav-cta"
              onClick={handleLogin}
              aria-label="Acceder al sistema de gestión"
            >
              Acceder al sistema
            </button>
          </nav>

          {/* Hamburger mobile */}
          <button
            id="btn-menu-toggle"
            className="menu-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {/* ─────────────────────────
          MENÚ MOBILE
          ───────────────────────── */}
      <nav
        id="mobile-nav"
        className={`mobile-nav${menuOpen ? ' open' : ''}`}
        aria-label="Navegación móvil"
        aria-hidden={!menuOpen}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <button
          id="btn-mobile-acceder"
          className="btn-nav-cta"
          onClick={() => { setMenuOpen(false); handleLogin(); }}
        >
          Acceder al sistema
        </button>
      </nav>

      {/* ─────────────────────────
          MAIN CONTENT
          ───────────────────────── */}
      <main id="main-content">

        {/* ══════ HERO ══════ */}
        <section
          id="hero"
          className="hero"
          ref={heroRef}
          aria-labelledby="hero-title"
        >
          {/* Imagen de fondo */}
          <div
            className={`hero-bg${heroBgLoaded ? ' loaded' : ''}`}
            role="img"
            aria-label="Imagen de catástrofe natural en Chile"
          />

          {/* Overlay cinematográfico */}
          <div className="hero-overlay" aria-hidden="true" />

          {/* Contenido */}
          <div className="hero-content">
            <div className="hero-inner">
              {/* Eyebrow */}
              <div className="hero-eyebrow" aria-label="Estado del sistema">
                <span className="hero-eyebrow-dot" aria-hidden="true" />
                Sistema activo — Chile
              </div>

              {/* Título principal */}
              <h1 id="hero-title" className="hero-title">
                Sistema Nacional de Coordinación y Monitoreo de{' '}
                <span className="hero-title-accent">Catástrofes en Chile</span>
              </h1>

              {/* Descripción */}
              <p className="hero-desc">
                Coordinamos autoridades, operadores y ciudadanos en tiempo real
                para proteger vidas, gestionar recursos y reconstruir comunidades
                cuando Chile más lo necesita.
              </p>

              {/* CTAs */}
              <div className="hero-actions">
                <button
                  id="btn-hero-acceder"
                  className="btn-primary"
                  onClick={handleLogin}
                  aria-label="Acceder al sistema de gestión"
                >
                  Acceder al sistema
                  <IconArrow />
                </button>
                <button
                  id="btn-hero-alertas"
                  className="btn-secondary"
                  aria-label="Ver alertas activas en Chile"
                >
                  <IconAlert />
                  Ver alertas activas
                </button>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="scroll-indicator" aria-hidden="true">
            <div className="scroll-line" />
            <span className="scroll-label">Scroll</span>
          </div>
        </section>

        {/* ══════ FRANJA DE BENEFICIOS ══════ */}
        <section
          id="beneficios"
          className="benefits-strip"
          aria-label="Capacidades del sistema"
        >
          <div
            className="benefits-grid"
            role="list"
          >
            {benefits.map((benefit, i) => (
              <article
                key={benefit.id}
                className="benefit-item"
                role="listitem"
                style={{
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div className="benefit-icon" aria-hidden="true">
                  {benefit.icon}
                </div>
                <h2 className="benefit-title" style={{ whiteSpace: 'pre-line' }}>
                  {benefit.title}
                </h2>
                <p className="benefit-subtitle">
                  {benefit.subtitle}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ══════ SECCIÓN ALERTAS (RabbitMQ Notifications) ══════ */}
        <section id="alertas" className="alerts-section">
          <div className="container">
            <div className="section-header-center">
              <div className="alert-badge-live">
                <span className="live-dot"></span>
                SISTEMA DE ALERTAS NACIONAL
              </div>
              <h2 className="section-title-large">Últimas Notificaciones de Emergencia</h2>
              <p className="section-desc-center">
                Información oficial generada automáticamente y en tiempo real sobre catástrofes activas en el territorio.
              </p>
            </div>

            {anunciosCargando && anuncios.length === 0 ? (
              <div className="alerts-loading">
                <Loader2 className="animate-spin" />
                <p>Sincronizando con el centro de alertas...</p>
              </div>
            ) : (
              <div className="alerts-masonry">
                {anuncios.map((anuncio, idx) => (
                  <div key={anuncio.id} className={`alert-card-public severity-${anuncio.severidad.toLowerCase()}`} style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="alert-card-header">
                      <div className="severity-indicator">
                        <AlertTriangle size={14} />
                        <span>{anuncio.severidad}</span>
                      </div>
                      <div className="alert-time">
                        <Clock size={12} />
                        <span>{new Date(anuncio.creadoEn).toLocaleTimeString("es-CL", { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <h3 className="alert-card-title">{anuncio.titulo}</h3>
                    <p className="alert-card-text">{anuncio.contenido}</p>
                    <div className="alert-card-footer">
                      <div className="alert-location">
                        <MapPin size={12} />
                        <span>{anuncio.region || "Cobertura Nacional"}</span>
                      </div>
                      <div className="alert-scope">{anuncio.alcance}</div>
                    </div>
                  </div>
                ))}

                {anuncios.length === 0 && (
                  <div className="no-alerts">
                    <Bell size={48} opacity={0.2} />
                    <p>No hay alertas críticas reportadas en los últimos minutos.</p>
                  </div>
                )}
              </div>
            )}

            <div className="alerts-actions">
              <button className="btn-secondary" onClick={() => router.push('/dashboard')}>
                Ver mapa interactivo
              </button>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
