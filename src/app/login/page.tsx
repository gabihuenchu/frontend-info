'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, Wifi, Users, Heart } from 'lucide-react';

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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/images/Login-FondoCatastrofeCL.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Centered Card */}
      <div className="relative z-10 w-full max-w-md">
        <div
          className="rounded-2xl p-8 backdrop-blur-sm border border-verde-oliva/30"
          style={{
            backgroundColor: 'rgba(80, 86, 49, 0.85)',
          }}
        >
          {/* Logo */}
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-0">
              <span className="text-3xl font-bold text-blanco-cremoso border-2 border-blanco-cremoso px-3 py-1">
                CATÁSTROFES
              </span>
              <span className="text-3xl font-bold text-verde-oscuro bg-rojo-catastrofe px-2 py-1 -ml-1">
                CL
              </span>
            </div>
          </div>

          {/* Red accent line */}
          <div className="h-1 w-12 bg-rojo-catastrofe mx-auto mb-6" />

          {/* Description */}
          <div className="mb-8 text-center">
            <h2 className="text-lg font-bold text-blanco-cremoso mb-3">
              Sistema de Gestión y Monitoreo de Catástrofes en Chile
            </h2>
            <p className="text-sm text-azul-grisaceo leading-relaxed">
              Monitoreamos en tiempo real las emergencias para proteger vidas, informar y unir a Chile cuando más se necesita.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {/* Email Field */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-azul-grisaceo w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Usuario"
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-verde-oscuro/30 border border-verde-oliva/50 text-blanco-cremoso placeholder-azul-grisaceo focus:outline-none focus:border-rojo-catastrofe transition"
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-azul-grisaceo w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full pl-12 pr-12 py-3 rounded-lg bg-verde-oscuro/30 border border-verde-oliva/50 text-blanco-cremoso placeholder-azul-grisaceo focus:outline-none focus:border-rojo-catastrofe transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-azul-grisaceo hover:text-rojo-catastrofe transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold text-lg bg-verde-oliva text-blanco-cremoso hover:bg-verde-oscuro transition"
            >
              INICIAR SESIÓN
            </button>
          </form>

          {/* Divider */}
          <div className="text-center text-azul-grisaceo text-sm mb-4">
            o continúa con
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 rounded-lg font-semibold text-blanco-cremoso border border-verde-oliva/50 hover:bg-verde-oscuro/30 transition flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continuar con Google</span>
          </button>

          {/* Feature Icons */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-verde-oliva/30">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-full bg-verde-oscuro/50 flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-blanco-cremoso" />
                </div>
              </div>
              <p className="text-blanco-cremoso text-xs font-semibold">Monitoreo en tiempo real</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-full bg-verde-oscuro/50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blanco-cremoso" />
                </div>
              </div>
              <p className="text-blanco-cremoso text-xs font-semibold">Información confiable</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-full bg-verde-oscuro/50 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-blanco-cremoso" />
                </div>
              </div>
              <p className="text-blanco-cremoso text-xs font-semibold">Colabora y ayuda</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
