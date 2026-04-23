'use client';

import React from 'react';
import Logo from '@/components/ui/Logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-blanco-cremoso">
      {/* Header */}
      <header className="bg-verde-oscuro shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Logo size="medium" variant="dark" />
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-white hover:text-blanco-cremoso transition-colors">
                Inicio
              </a>
              <a href="#" className="text-white hover:text-blanco-cremoso transition-colors">
                Centros de Acopio
              </a>
              <a href="#" className="text-white hover:text-blanco-cremoso transition-colors">
                Donaciones
              </a>
              <a href="#" className="text-white hover:text-blanco-cremoso transition-colors">
                Necesidades
              </a>
              <a href="#" className="text-white hover:text-blanco-cremoso transition-colors">
                Contacto
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-verde-oscuro mb-6">
            Plataforma de Respuesta a Catástrofes
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Coordinamos esfuerzos humanitarios para ayudar a las comunidades afectadas 
            por catástrofes naturales en Chile.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-verde-oscuro text-white px-8 py-3 rounded-lg hover:bg-verde-oliva transition-colors">
              Ver Centros de Acopio
            </button>
            <button className="border-2 border-verde-oscuro text-verde-oscuro px-8 py-3 rounded-lg hover:bg-verde-oscuro hover:text-white transition-colors">
              Cómo Donar
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-verde-oscuro mb-12">
            Servicios Disponibles
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 border-2 border-azul-grisaceo rounded-lg">
              <div className="w-16 h-16 bg-verde-oscuro rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-verde-oscuro mb-2">
                Centros de Acopio
              </h3>
              <p className="text-gray-600">
                Encuentra los centros más cercanos para donar o recibir ayuda.
              </p>
            </div>
            <div className="text-center p-6 border-2 border-azul-grisaceo rounded-lg">
              <div className="w-16 h-16 bg-rojo-catastrofe rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-verde-oscuro mb-2">
                Registro de Necesidades
              </h3>
              <p className="text-gray-600">
                Reporta necesidades urgentes en tu comunidad.
              </p>
            </div>
            <div className="text-center p-6 border-2 border-azul-grisaceo rounded-lg">
              <div className="w-16 h-16 bg-verde-oliva rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-verde-oscuro mb-2">
                Seguimiento de Donaciones
              </h3>
              <p className="text-gray-600">
                Monitorea el impacto de tus donaciones en tiempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-verde-oscuro text-white py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo size="small" variant="dark" />
            <div className="mt-4 md:mt-0 text-center md:text-right">
              <p>&copy; 2024 CatástrofesCL. Todos los derechos reservados.</p>
              <p className="text-sm text-gray-300 mt-1">
                Plataforma de gestión humanitaria para Chile
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
