'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseAuthClient, inicializarFirebaseRuntime } from '@/services/firebaseClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  authEnabled: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  authEnabled: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authEnabled, setAuthEnabled] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelado = false;

    (async () => {
      // Carga la config de Firebase en runtime si no se horneó en build.
      await inicializarFirebaseRuntime();
      if (cancelado) return;

      const auth = getFirebaseAuthClient();

      if (!auth) {
        console.warn('Firebase Auth no disponible. Continuando sin autenticación.');
        setAuthEnabled(false);
        setLoading(false);
        return;
      }

      setAuthEnabled(true);

      unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
    })();

    return () => {
      cancelado = true;
      unsubscribe?.();
    };
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    authEnabled,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
