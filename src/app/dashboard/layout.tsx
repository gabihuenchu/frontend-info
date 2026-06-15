'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { DashboardThemeProvider, useDashboardTheme } from '@/providers/DashboardThemeProvider';
import Sidebar from '@/components/sidebar';
import '@/styles/emergency.css';

function DashboardChrome({ children }: { children: React.ReactNode }) {
  const { dark, setDark, theme } = useDashboardTheme();

  return (
    <div className={`dashboard-root ${theme}`}>
      <Sidebar dark={dark} setDark={setDark} />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/dashboard/emergency');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--dark-bg-sidebar)',
          color: '#fff',
        }}
      >
        Verificando sesión…
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardThemeProvider>
      <DashboardChrome>{children}</DashboardChrome>
    </DashboardThemeProvider>
  );
}
