'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, User, Lock, Wifi, Users, Heart, CheckCircle2 } from 'lucide-react';

import { AuthService } from '@/services/auth.service';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setShowSuccess(true);
      router.replace('/login');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const session = await AuthService.login(email, password);

      localStorage.setItem('user', JSON.stringify({
        email: session.email,
        token: session.token,
        profile: session.profile,
      }));

      const profile = session.profile as { roles?: Array<string | { nombre?: string }> } | null;
      const roleNames = (profile?.roles ?? []).map((r) =>
        typeof r === 'string' ? r : r?.nombre ?? ''
      );
      const hasAdminRole = roleNames.includes('ADMINISTRADOR');
      const nextPath = searchParams.get('next');

      if (hasAdminRole) {
        router.push(
          nextPath?.startsWith('/dashboard')
            ? nextPath
            : '/dashboard/logistica'
        );
      } else if (nextPath?.startsWith('/dashboard')) {
        setError('Tu cuenta no tiene rol ADMINISTRADOR. Contacta al administrador del sistema.');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      console.error('Error en login:', err);
      const backendDetail =
        typeof err.response?.data?.detail === 'string' ? err.response.data.detail : null;

      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setError(
          'No existe una cuenta con ese correo y contraseña en Firebase. Verifica tus datos o créala en Registrarse.'
        );
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError(
          backendDetail ||
            'No se pudo validar tu sesión en el sistema. Intenta de nuevo o contacta al administrador.'
        );
      } else if (err.response?.status === 404) {
        setError(
          backendDetail ||
            'Tu sesión en Firebase es válida, pero no se pudo cargar el perfil. Intenta de nuevo en unos segundos.'
        );
      } else {
        setError(backendDetail || 'Error al intentar iniciar sesión. Inténtalo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login');
  };

  return (
    <div className="login-page">
      <div className="login-overlay" />
      <div className="login-card-wrapper">
        <div className="login-card">
          
          <Image
            src="/images/Logo-sin-fondo.png"
            alt="CatástrofesCL"
            width={360}
            height={80}
            priority
            className="login-logo-image"
          />

          <div className="login-accent-line" />

          <div className="login-copy">
            <h1>Sistema de Gestión y Monitoreo de Catástrofes en Chile</h1>
            <p>
              Monitoreamos en tiempo real las emergencias para proteger vidas, informar y unir a Chile
              cuando más se necesita.
            </p>
          </div>

          {showSuccess && (
            <div style={{ 
              background: 'rgba(139, 154, 70, 0.2)', 
              color: '#8B9A46', 
              padding: '1rem', 
              borderRadius: '12px', 
              marginBottom: '1.5rem', 
              fontSize: '0.9rem', 
              border: '1px solid rgba(139, 154, 70, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontWeight: 600
            }}>
              <CheckCircle2 size={20} />
              <span>¡Cuenta creada con éxito! Ya puedes iniciar sesión.</span>
            </div>
          )}

          {error && (
            <div style={{ 
              background: 'rgba(220, 38, 38, 0.2)', 
              color: '#ef4444', 
              padding: '1rem', 
              borderRadius: '12px', 
              marginBottom: '1.5rem', 
              fontSize: '0.9rem', 
              border: '1px solid rgba(220, 38, 38, 0.4)',
              fontWeight: 600
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <User size={18} className="login-field-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Usuario"
                required
              />
            </div>

            <div className="login-field">
              <Lock size={18} className="login-field-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-password-toggle"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN'}
            </button>
          </form>

    

          <button type="button" onClick={handleGoogleLogin} className="login-google">
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continuar con Google</span>
          </button>

          <div className="login-register">
            <p style={{color: 'rgba(255,255,255,0.9)', fontWeight: 600}}>¿No tienes cuenta? <Link href="/register" className="login-register-link">Crear cuenta</Link></p>
          </div>

          <div className="login-features">
            <div className="login-feature-item">
              <div className="login-feature-icon">
                <Wifi size={34} />
              </div>
              <p>
                Monitoreo
                <br />
                en tiempo real
              </p>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon">
                <Users size={34} />
              </div>
              <p>
                Información
                <br />
                confiable
              </p>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon">
                <Heart size={34} />
              </div>
              <p>
                Colabora
                <br />
                y ayuda
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="login-page"><div className="login-card">Cargando...</div></div>}>
      <LoginContent />
    </Suspense>
  );
}
