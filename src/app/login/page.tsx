'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, Wifi, Users, Heart, Bell, Activity, Waves, Flame, HelpCircle } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic
    console.log('Login attempt:', { email, password });
  };

  const handleGoogleLogin = () => {
    // Handle Google login
    console.log('Google login');
  };

  return (
    <div className="min-h-screen catastrofes-bg flex">
      {/* Left Panel - Login Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 lg:p-12">
        {/* Logo and Title */}
        <div className="mb-8">
          <div className="flex items-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-blanco-puro border-2 border-verde-claro px-3 py-2">CATÁSTROFES</h1>
            <span className="bg-verde-claro text-verde-oscuro text-xl lg:text-2xl font-bold px-2 py-2 -ml-1">CL</span>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex-1 flex flex-col justify-center max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-blanco-puro mb-4">
              Sistema de Gestión y Monitoreo de Catástrofes en Chile
            </h2>
            <p className="text-gris-medio text-lg leading-relaxed">
              Monitoreamos en tiempo real las emergencias para proteger vidas, informar y unir a Chile cuando más se necesita.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gris-medio w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Usuario"
                className="input-field w-full pl-12 pr-4 py-4 rounded-lg focus:outline-none"
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gris-medio w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="input-field w-full pl-12 pr-12 py-4 rounded-lg focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gris-medio hover:text-blanco-puro"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="btn-primary w-full py-4 rounded-lg font-semibold text-lg"
            >
              INICIAR SESIÓN
            </button>

            {/* Divider */}
            <div className="text-center text-gris-medio text-sm">
              o continúa con
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="btn-google w-full py-4 rounded-lg font-semibold text-lg flex items-center justify-center space-x-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continuar con Google</span>
            </button>
          </form>
        </div>

        {/* Bottom Features */}
        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="text-center">
            <div className="feature-icon mx-auto">
              <Wifi className="w-6 h-6 text-blanco-puro" />
            </div>
            <p className="text-blanco-puro text-sm mt-2">Monitoreo en tiempo real</p>
          </div>
          <div className="text-center">
            <div className="feature-icon mx-auto">
              <Users className="w-6 h-6 text-blanco-puro" />
            </div>
            <p className="text-blanco-puro text-sm mt-2">Información confiable</p>
          </div>
          <div className="text-center">
            <div className="feature-icon mx-auto">
              <Heart className="w-6 h-6 text-blanco-puro" />
            </div>
            <p className="text-blanco-puro text-sm mt-2">Colabora y ayuda</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Alerts and Information */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative">
        {/* Alert Box */}
        <div className="alert-box p-6 rounded-lg mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="alert-icon" />
            <h3 className="text-blanco-puro font-bold text-lg">ALERTAS ACTIVAS</h3>
          </div>
          <div className="space-y-2">
            <p className="text-blanco-puro">Zonas costeras - Riesgo de tsunami</p>
            <p className="text-rojo-brillante font-semibold">Región de Valparaíso</p>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-64 h-64 bg-gradient-to-br from-verde-oliva to-rojo-alerta rounded-full opacity-20 mb-4 mx-auto"></div>
            <p className="text-gris-medio text-lg">Mapa de alertas activas</p>
          </div>
        </div>

        {/* Bottom Information */}
        <div className="space-y-6">
          {/* Slogan */}
          <div className="text-center">
            <p className="slogan-text text-2xl text-blanco-puro">
              INFORMAR ES <span className="highlight">PREVENIR</span>. UNIR ES RESISTIR.
            </p>
          </div>

          {/* Info Icons */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="feature-icon mx-auto">
                <Activity className="w-5 h-5 text-blanco-puro" />
              </div>
              <p className="text-blanco-puro text-xs mt-1 font-semibold">SISMOS</p>
              <p className="text-gris-medio text-xs">Monitoreo sísmico en tiempo real</p>
            </div>
            <div className="text-center">
              <div className="feature-icon mx-auto">
                <Waves className="w-5 h-5 text-blanco-puro" />
              </div>
              <p className="text-blanco-puro text-xs mt-1 font-semibold">TSUNAMIS</p>
              <p className="text-gris-medio text-xs">Alertas tempranas y zonas de evacuación</p>
            </div>
            <div className="text-center">
              <div className="feature-icon mx-auto">
                <Flame className="w-5 h-5 text-blanco-puro" />
              </div>
              <p className="text-blanco-puro text-xs mt-1 font-semibold">INCENDIOS</p>
              <p className="text-gris-medio text-xs">Detección de focos activos</p>
            </div>
            <div className="text-center">
              <div className="feature-icon mx-auto">
                <HelpCircle className="w-5 h-5 text-blanco-puro" />
              </div>
              <p className="text-blanco-puro text-xs mt-1 font-semibold">AYUDA</p>
              <p className="text-gris-medio text-xs">Conecta, dona y haz la diferencia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
