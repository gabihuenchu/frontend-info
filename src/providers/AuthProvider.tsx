'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseAuthClient } from '@/services/firebaseClient';

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
    const auth = getFirebaseAuthClient();
    
    if (!auth) {
      console.warn('Firebase Auth no disponible. Continuando sin autenticación.');
      setAuthEnabled(false);
      setLoading(false);
      return;
    }

    setAuthEnabled(true);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
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
