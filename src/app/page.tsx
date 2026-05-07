'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Waves, Flame, HelpCircle, Bell, Shield, Users, MapPin } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [currentBanner, setCurrentBanner] = useState(0);
  
  const banners = [
    '/images/banner01.png',
    '/images/banner02.png',
    '/images/banner03.png'
  ];

  const handleLogin = () => {
    router.push('/login');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000); // Cambiar cada 5 segundos

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="min-h-screen catastrofes-bg">
      {/* Header */}
      <header className="bg-verde-oliva
      /90 backdrop-blur-sm border-b border-gris-medio/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-3xl lg:text-4xl font-bold text-blanco-puro border-2 border-verde-claro px-3 py-2">CATÁSTROFES</h1>
              <span className="bg-verde-claro text-verde-oscuro text-xl lg:text-2xl font-bold px-2 py-2 -ml-1">CL</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-blanco-puro hover:text-rojo-brillante transition-colors">
                Inicio
              </a>
              <a href="#" className="text-blanco-puro hover:text-rojo-brillante transition-colors">
                Alertas
              </a>
              <a href="#" className="text-blanco-puro hover:text-rojo-brillante transition-colors">
                Centros de Acopio
              </a>
              <a href="#" className="text-blanco-puro hover:text-rojo-brillante transition-colors">
                Donaciones
              </a>
              <button 
                onClick={handleLogin}
                className="bg-verde-oliva text-blanco-puro px-4 py-2 rounded-lg hover:bg-verde-acento transition-colors"
              >
                Iniciar Sesión
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          {/* Banner Image */}
          <div className="mb-8 flex justify-center">
            <img 
              src="/images/banner01.png" 
              alt="Banner CatástrofesCL" 
              className="w-full max-w-4xl h-auto rounded-lg shadow-2xl"
            />
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-blanco-puro mb-6">
            Sistema de Gestión y Monitoreo de Catástrofes
          </h1>
          <p className="text-xl text-gris-medio mb-8 max-w-3xl mx-auto leading-relaxed">
            Monitoreamos en tiempo real las emergencias para proteger vidas, informar y unir a Chile cuando más se necesita.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={handleLogin}
              className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg"
            >
              Acceder al Sistema
            </button>
            <button className="border-2 border-blanco-puro text-blanco-puro px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blanco-puro hover:text-verde-oscuro transition-colors">
              Ver Alertas Activas
            </button>
          </div>
        </div>
      </section>

      {/* About Image */}
      <section className="py-16 px-4 bg-negro/50">
        <div className="container mx-auto">
          <div className="flex justify-center">
            <img 
              src="/images/about01.png" 
              alt="Sobre CatástrofesCL" 
              style={{ width: '1200px', height: 'auto' }}
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Active Alerts */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="alert-box p-6 rounded-lg mb-8 max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="alert-icon" />
              <h2 className="text-blanco-puro font-bold text-2xl">ALERTAS ACTIVAS</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-negro/50 p-4 rounded-lg">
                <p className="text-blanco-puro font-semibold">Zonas costeras - Riesgo de tsunami</p>
                <p className="text-rojo-brillante">Región de Valparaíso</p>
              </div>
              <div className="bg-negro/50 p-4 rounded-lg">
                <p className="text-blanco-puro font-semibold">Alta temperatura - Riesgo de incendios</p>
                <p className="text-rojo-brillante">Región Metropolitana</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-gris-oscuro/20">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-blanco-puro mb-12">
              Nuestros Servicios
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-negro/40 p-6 rounded-lg border border-gris-medio/20 hover:border-verde-claro/50 transition-all duration-300">
                <div className="feature-icon mx-auto mb-4">
                  <Activity className="w-10 h-10 text-verde-claro" />
                </div>
                <h3 className="text-xl font-semibold text-blanco-puro mb-2">Monitoreo Sísmico</h3>
                <p className="text-gris-medio text-sm">
                  Detección en tiempo real de movimientos telúricos
                </p>
              </div>
              <div className="bg-negro/40 p-6 rounded-lg border border-gris-medio/20 hover:border-verde-claro/50 transition-all duration-300">
                <div className="feature-icon mx-auto mb-4">
                  <Waves className="w-10 h-10 text-verde-claro" />
                </div>
                <h3 className="text-xl font-semibold text-blanco-puro mb-2">Alertas de Tsunami</h3>
                <p className="text-gris-medio text-sm">
                  Sistema de alerta temprana y zonas de evacuación
                </p>
              </div>
              <div className="bg-negro/40 p-6 rounded-lg border border-gris-medio/20 hover:border-verde-claro/50 transition-all duration-300">
                <div className="feature-icon mx-auto mb-4">
                  <Flame className="w-10 h-10 text-rojo-brillante" />
                </div>
                <h3 className="text-xl font-semibold text-blanco-puro mb-2">Detección de Incendios</h3>
                <p className="text-gris-medio text-sm">
                  Monitoreo de focos activos y riesgo forestal
                </p>
              </div>
              <div className="bg-negro/40 p-6 rounded-lg border border-gris-medio/20 hover:border-verde-claro/50 transition-all duration-300">
                <div className="feature-icon mx-auto mb-4">
                  <HelpCircle className="w-10 h-10 text-verde-claro" />
                </div>
                <h3 className="text-xl font-semibold text-blanco-puro mb-2">Centro de Ayuda</h3>
                <p className="text-gris-medio text-sm">
                  Conecta voluntarios y organiza la respuesta
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-blanco-puro mb-12">
              Plataforma Integral
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-gris-oscuro/30 rounded-lg border border-gris-medio/20 hover:border-verde-claro/30 transition-all duration-300">
                <div className="feature-icon mx-auto mb-6">
                  <MapPin className="w-12 h-12 text-verde-claro" />
                </div>
                <h3 className="text-2xl font-semibold text-blanco-puro mb-4">Centros de Acopio</h3>
                <p className="text-gris-medio leading-relaxed">
                  Encuentra los centros más cercanos para donar o recibir ayuda. Mapa interactivo en tiempo real.
                </p>
              </div>
              <div className="text-center p-8 bg-gris-oscuro/30 rounded-lg border border-gris-medio/20 hover:border-verde-claro/30 transition-all duration-300">
                <div className="feature-icon mx-auto mb-6">
                  <Users className="w-12 h-12 text-verde-claro" />
                </div>
                <h3 className="text-2xl font-semibold text-blanco-puro mb-4">Registro de Necesidades</h3>
                <p className="text-gris-medio leading-relaxed">
                  Reporta necesidades urgentes en tu comunidad. Sistema validado y coordinado.
                </p>
              </div>
              <div className="text-center p-8 bg-gris-oscuro/30 rounded-lg border border-gris-medio/20 hover:border-verde-claro/30 transition-all duration-300">
                <div className="feature-icon mx-auto mb-6">
                  <Shield className="w-12 h-12 text-verde-claro" />
                </div>
                <h3 className="text-2xl font-semibold text-blanco-puro mb-4">Seguimiento</h3>
                <p className="text-gris-medio leading-relaxed">
                  Monitorea el impacto de tus donaciones en tiempo real. Trazabilidad completa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slogan */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <p className="slogan-text text-4xl lg:text-5xl text-blanco-puro">
            INFORMAR ES <span className="highlight">PREVENIR</span>. UNIR ES RESISTIR.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-verde-oscuro/90 backdrop-blur-sm border-t border-gris-medio/20 text-blanco-puro py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <h1 className="text-xl lg:text-2xl font-bold text-blanco-puro border-2 border-verde-claro px-2 py-1">CATÁSTROFES</h1>
              <span className="bg-verde-claro text-verde-oscuro text-lg lg:text-xl font-bold px-1 py-1 -ml-1">CL</span>
            </div>
            <div className="text-center md:text-right">
              <p>&copy; 2024 CatástrofesCL. Todos los derechos reservados.</p>
              <p className="text-sm text-gris-medio mt-1">
                Plataforma de gestión humanitaria para Chile
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
