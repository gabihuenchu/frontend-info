'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, User, Mail, Lock, Wifi, Users, Heart } from 'lucide-react';

import { AuthService } from '@/services/auth.service';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [docType, setDocType] = useState('RUT');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('DEBUG: handleSubmit called', { name, lastName, email, docNumber, docType, password, confirm });

    if (password !== confirm) {
      console.log('DEBUG: password mismatch');
      setError('Las contraseñas no coinciden');
      return;
    }

    // Normalize RUT (remove dots and hyphen) for validation and sending
    const normalizedRut = docNumber.replace(/\./g, '').replace(/-/g, '').toUpperCase().trim();
    console.log('DEBUG: normalizedRut', normalizedRut);
    if (docType === 'RUT') {
      if (!validateRut(normalizedRut)) {
        console.log('DEBUG: RUT validation failed');
        setError('RUT inválido. Asegúrate del formato xx.xxx.xxx-x y dígito verificador.');
        return;
      }
    }

    setLoading(true);
    try {
      console.log('DEBUG: calling AuthService.register', { correo: email, nombres: name, apellidos: lastName, numeroDocumento: docType === 'RUT' ? normalizedRut : docNumber, tipoDocumento: docType });
      await AuthService.register({
        correo: email,
        password,
        nombres: name,
        apellidos: lastName,
        numeroDocumento: docType === 'RUT' ? normalizedRut : docNumber,
        tipoDocumento: docType,
        telefono: '',
        pais: 'CL',
      });
      router.push('/login?registered=true');
    } catch (err: any) {
      console.error('Error en registro:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Ese correo ya está registrado en Firebase.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El correo electrónico no es válido.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil (mínimo 6 caracteres).');
      } else {
        const serverMsg = err.response?.data?.debugMessage || err.response?.data?.detail;
        console.error('Respuesta del servidor:', err.response?.data);
        setError(serverMsg || 'Ocurrió un error al crear la cuenta. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const normalizeRut = (rut: string) => {
    return rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  };

  const formatRut = (value: string) => {
    const cleaned = value.replace(/[^0-9kK]/g, '').toUpperCase();
    if (cleaned.length === 0) return '';
    if (cleaned.length === 1) return cleaned;
    const dv = cleaned.slice(-1);
    const nums = cleaned.slice(0, -1);
    const rev = nums.split('').reverse();
    const groups: string[] = [];
    for (let i = 0; i < rev.length; i += 3) {
      groups.push(rev.slice(i, i + 3).reverse().join(''));
    }
    const formattedNums = groups.reverse().join('.');
    return `${formattedNums}-${dv}`;
  };

  const validateRut = (rut: string) => {
    if (!rut) return false;
    // Normalize input: accept formatted (xx.xxx.xxx-x) or plain (xxxxxxxx-x)
    const norm = String(rut).replace(/\./g, '').replace(/-/g, '').toUpperCase().trim();
    if (norm.length < 2) return false;
    const body = norm.slice(0, -1);
    const dv = norm.slice(-1);

    // LENIENT MODE: allow any digit verifier (DEV / compatibility)
    // Esto acepta cualquier DV que sea dígito o 'K'.
    // Riesgo: pueden almacenarse RUTs con DV incorrecto; recomendable solo para pruebas.
    const lenientRutValidation = true; // cambiar a false para validación estricta
    if (lenientRutValidation) {
      if (!/^[0-9]+$/.test(body)) return false;
      return /^[0-9K]$/i.test(dv);
    }

    // Modulo 11 algorithm (strict mode)
    if (!/^[0-9]+$/.test(body)) return false;
    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body.charAt(i), 10) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const remainder = sum % 11;
    const digit = 11 - remainder;
    let dvCalc = '';
    if (digit === 11) dvCalc = '0';
    else if (digit === 10) dvCalc = 'K';
    else dvCalc = String(digit);

    return dvCalc === dv.toUpperCase();
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
            <h1>Crear cuenta</h1>
            <p>
              Únete al sistema de gestión de emergencias para poder colaborar y mantenerte informado.
            </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(220, 38, 38, 0.2)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid rgba(220, 38, 38, 0.4)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="login-field">
                <User size={18} className="login-field-icon" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombres"
                  required
                />
              </div>
              <div className="login-field">
                <User size={18} className="login-field-icon" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Apellidos"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <Mail size={18} className="login-field-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                required
              />
            </div>

            <div className="login-document-row">
              <div className="login-field login-select-field">
                <select
                  className="login-select"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                >
                  <option value="RUT">RUT</option>
                  <option value="PASAPORTE">PAS</option>
                  <option value="DNI">DNI</option>
                </select>
              </div>
              <div className="login-field">
                <Lock size={18} className="login-field-icon" />
                <input
                  className="login-document-input"
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(formatRut(e.target.value))}
                  placeholder="Número de documento"
                  autoComplete="off"
                  style={{ background: '#00000059', color: '#ffffff' }}
                  required
                />
              </div>
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
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="login-field">
              <Lock size={18} className="login-field-icon" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirmar contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="login-password-toggle"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
            </button>
          </form>

          <button type="button" onClick={() => console.log('Google register')} className="login-google">
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continuar con Google</span>
          </button>

          <div className="login-register">
            <p style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
              ¿Tienes cuenta? <Link href="/login" className="login-register-link">Iniciar sesión</Link>
            </p>
          </div>

          <div className="login-features">
            <div className="login-feature-item">
              <div className="login-feature-icon">
                <Wifi size={34} />
              </div>
              <p>Monitoreo<br />en tiempo real</p>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon">
                <Users size={34} />
              </div>
              <p>Información<br />confiable</p>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon">
                <Heart size={34} />
              </div>
              <p>Colabora<br />y ayuda</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}