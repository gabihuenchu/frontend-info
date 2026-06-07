'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface DashboardThemeContextValue {
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
  theme: 'dark' | 'light';
}

const DashboardThemeContext = createContext<DashboardThemeContextValue | null>(null);

export function DashboardThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(true);
  const theme = dark ? 'dark' : 'light';

  return (
    <DashboardThemeContext.Provider value={{ dark, setDark, theme }}>
      {children}
    </DashboardThemeContext.Provider>
  );
}

export function useDashboardTheme(): DashboardThemeContextValue {
  const ctx = useContext(DashboardThemeContext);
  if (!ctx) {
    throw new Error('useDashboardTheme debe usarse dentro de DashboardThemeProvider');
  }
  return ctx;
}
