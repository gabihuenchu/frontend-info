'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAnuncios, useEmergenciasActivas } from '@/hooks/useEmergencies';
import type { Emergencia, EstadoEmergencia, NivelSeveridad, TipoEmergencia } from '@/services/emergency.service';
import {
  MapPin, Clock, AlertTriangle, Bell, Loader2, Flame, Waves, CloudRain,
  Mountain, Zap, Activity, CalendarDays, Users, Box, HeartHandshake, Map,
} from 'lucide-react';
import { DonationStepsGuide } from '@/components/citizen/DonationStepsGuide';
import './inicio.css';
import '@/styles/citizen.css';

/* ── Iconos SVG inline ── */
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

type BenefitTheme = 'green' | 'orange' | 'blue' | 'purple';

/* ── Datos de beneficios (hero) ── */
const benefits: {
  id: string;
  theme: BenefitTheme;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}[] = [
  {
    id: 'coordinacion',
    theme: 'green',
    icon: <Users size={18} strokeWidth={1.75} />,
    title: 'Coordinación Efectiva',
    subtitle: 'Respuesta articulada entre autoridades, operadores y ciudadanos.',
  },
  {
    id: 'monitoreo',
    theme: 'orange',
    icon: <Clock size={18} strokeWidth={1.75} />,
    title: 'Monitoreo 24/7',
    subtitle: 'Alertas y estado de emergencias en tiempo real desde el centro de coordinación.',
  },
  {
    id: 'recursos',
    theme: 'blue',
    icon: <Box size={18} strokeWidth={1.75} />,
    title: 'Gestión de Recursos',
    subtitle: 'Control de inventario y centros de acopio automatizado para una distribución eficiente.',
  },
  {
    id: 'ciudadano',
    theme: 'purple',
    icon: <HeartHandshake size={18} strokeWidth={1.75} />,
    title: 'Apoyo Ciudadano',
    subtitle: 'Canal directo para donar, reportar necesidades y ofrecer voluntariado.',
  },
  {
    id: 'chile',
    theme: 'green',
    icon: <Map size={18} strokeWidth={1.75} />,
    title: 'Chile Unido',
    subtitle: 'Una sola plataforma para todo el territorio nacional, conectando a todo el país.',
  },
];

const tipoEmergenciaLabel: Record<TipoEmergencia, string> = {
  TERREMOTO: 'Terremoto',
  TSUNAMI: 'Tsunami',
  INCENDIO: 'Incendio',
  INUNDACION: 'Inundación',
  ERUPCION: 'Erupción volcánica',
  ALUVION: 'Aluvión',
};

const estadoEmergenciaLabel: Record<EstadoEmergencia, string> = {
  ACTIVA: 'Activa',
  CONTROLADA: 'Controlada',
  FINALIZADA: 'Finalizada',
};

const iconoTipoEmergencia: Record<TipoEmergencia, React.ReactNode> = {
  TERREMOTO: <Zap size={18} />,
  TSUNAMI: <Waves size={18} />,
  INCENDIO: <Flame size={18} />,
  INUNDACION: <CloudRain size={18} />,
  ERUPCION: <Mountain size={18} />,
  ALUVION: <Mountain size={18} />,
};

function severidadEtiquetaPublica(severidad: NivelSeveridad): string {
  const map: Record<NivelSeveridad, string> = {
    CRITICA: 'CRÍTICO',
    ALTA: 'ALTO',
    MEDIA: 'MEDIO',
    BAJA: 'BAJO',
  };
  return map[severidad];
}

function formatearFechaEmergencia(em: Emergencia): string {
  const raw = em.iniciada ?? em.createdAt;
  if (!raw) return 'Sin fecha';
  return new Date(raw).toLocaleString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ── Nav links ── */
const navLinks = [
  { label: 'Inicio', href: '#' },
  { label: 'Emergencias', href: '#emergencias' },
  { label: 'Alertas', href: '#alertas' },
  { label: 'Centros de Acopio', href: '#centros' },
  { label: 'Donaciones', href: '/donaciones' },
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

  const { data: emergencias = [], isLoading: emergenciasCargando, isError: emergenciasError } =
    useEmergenciasActivas({ refetchInterval: 120_000 });

  const { data: anunciosData, isLoading: anunciosCargando } = useAnuncios();
  const anuncios = (anunciosData?.content || []).slice(0, 6);

  const scrollToEmergencias = () => {
    document.getElementById('emergencias')?.scrollIntoView({ behavior: 'smooth' });
  };

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
                  id="btn-hero-emergencias"
                  className="btn-secondary"
                  aria-label="Ver emergencias activas en Chile"
                  onClick={scrollToEmergencias}
                >
                  <IconAlert />
                  Ver emergencias activas
                </button>
                <button
                  id="btn-hero-donaciones"
                  className="btn-secondary"
                  aria-label="Ir a donaciones y necesidades"
                  onClick={() => router.push('/donaciones')}
                >
                  Donar recursos
                </button>
              </div>
            </div>
          </div>

          {/* Cards de capacidades — sobre el hero */}
          <div id="beneficios" className="hero-benefits" aria-label="Capacidades del sistema">
            <div className="hero-benefits__grid" role="list">
              {benefits.map((benefit, i) => (
                <article
                  key={benefit.id}
                  className={`benefit-card benefit-card--${benefit.theme}`}
                  role="listitem"
                  style={{ animationDelay: `${0.75 + i * 0.08}s` }}
                >
                  <span className="benefit-card__glow" aria-hidden="true" />
                  <div className="benefit-card__head">
                    <div className="benefit-card__icon" aria-hidden="true">
                      {benefit.icon}
                    </div>
                    <h2 className="benefit-card__title">{benefit.title}</h2>
                  </div>
                  <p className="benefit-card__desc">{benefit.subtitle}</p>
                  <span className="benefit-card__arrow" aria-hidden="true">
                    <IconArrow />
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ EMERGENCIAS ACTIVAS (API pública) ══════ */}
        <section id="emergencias" className="emergencias-section">
          <div className="emergencias-section__glow" aria-hidden="true" />
          <div className="emergencias-section__waves" aria-hidden="true" />

          <div className="container emergencias-section__inner">
            <header className="emergencias-section__header">
              <div className="emergencias-badge-live">
                <span className="emergencias-badge-live__dot" />
                MONITOREO EN TIEMPO REAL
              </div>
              <h2 className="emergencias-section__title">
                Emergencias <span className="emergencias-section__title-accent">activas</span> en Chile
              </h2>
              <p className="emergencias-section__desc">
                Catástrofes declaradas oficialmente en el sistema. Información actualizada desde el centro de coordinación nacional.
              </p>
            </header>

            {emergenciasCargando && emergencias.length === 0 ? (
              <div className="emergencias-loading">
                <Loader2 size={28} className="animate-spin" />
                <p>Cargando emergencias activas...</p>
              </div>
            ) : emergenciasError ? (
              <div className="emergencias-empty">
                <AlertTriangle size={40} opacity={0.35} />
                <p>No fue posible cargar las emergencias en este momento.</p>
                <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>
                  Reintentar
                </button>
              </div>
            ) : (
              <div className="emergencias-list-public">
                {emergencias.length === 0 ? (
                  <div className="emergencias-empty emergencias-empty--full">
                    <AlertTriangle size={48} opacity={0.25} />
                    <p>No hay emergencias activas reportadas en este momento.</p>
                    <span className="emergencias-empty__hint">El territorio se encuentra sin alertas declaradas.</span>
                  </div>
                ) : (
                  emergencias.map((em, idx) => (
                    <article
                      key={em.id}
                      className={`emergencia-card-v2 severidad-${em.severidad.toLowerCase()}`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <span className={`emergencia-card-v2__badge severidad-${em.severidad.toLowerCase()}`}>
                        {severidadEtiquetaPublica(em.severidad)}
                      </span>

                      <div className="emergencia-card-v2__content">
                        <div className="emergencia-card-v2__main">
                          <div className="emergencia-card-v2__tipo">
                            <span className="emergencia-card-v2__icon" aria-hidden="true">
                              {iconoTipoEmergencia[em.tipo] ?? <AlertTriangle size={18} />}
                            </span>
                            <div>
                              <p className="emergencia-card-v2__label">Tipo</p>
                              <h3 className="emergencia-card-v2__nombre">
                                {tipoEmergenciaLabel[em.tipo] ?? em.tipo}
                              </h3>
                            </div>
                          </div>

                          <div className="emergencia-card-v2__details">
                            <div className="emergencia-card-v2__ubicacion">
                              <MapPin size={14} className="emergencia-card-v2__pin" />
                              <p className="emergencia-card-v2__lugar">{em.region}</p>
                            </div>

                            <div className="emergencia-card-v2__meta">
                              <span className={`emergencia-card-v2__estado estado-${em.estado.toLowerCase()}`}>
                                <Activity size={12} />
                                {estadoEmergenciaLabel[em.estado]}
                              </span>
                              <span className="emergencia-card-v2__fecha">
                                <CalendarDays size={12} />
                                {formatearFechaEmergencia(em)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="emergencia-card-v2__zona">
                          {em.zonaImpacto?.coordinates?.[0]?.length
                            ? 'Zona de impacto registrada en el mapa oficial'
                            : 'Epicentro registrado en el sistema'}
                        </p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}
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

          </div>
        </section>

        {/* ══════ DONACIONES / PARTICIPACIÓN CIUDADANA ══════ */}
        <section
          id="donaciones"
          className="benefits-strip"
          aria-labelledby="donaciones-title"
        >
          <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '3rem 1.5rem' }}>
            <div className="hero-eyebrow" style={{ marginBottom: '1rem' }}>
              <span className="hero-eyebrow-dot" aria-hidden="true" />
              Apoyo ciudadano
            </div>
            <h2 id="donaciones-title" className="hero-title" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0.75rem' }}>
              Dona recursos donde más se necesitan
            </h2>
            <p className="hero-desc" style={{ maxWidth: '560px', marginBottom: '1.5rem' }}>
              Acércate a una sucursal con los insumos que desees donar. No necesitas registrarte ni
              agendar cita: revisa qué se necesita y entrega presencialmente en el centro de acopio.
            </p>
            <DonationStepsGuide variant="compact" className="home-donation-steps" />
            <div className="hero-actions">
              <button
                id="btn-donaciones-ver"
                className="btn-primary"
                onClick={() => router.push('/donaciones')}
              >
                Cómo donar
                <IconArrow />
              </button>
              <button
                id="btn-donaciones-sucursales"
                className="btn-secondary"
                onClick={() => router.push('/donaciones#sucursales')}
              >
                Ver sucursales
              </button>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
