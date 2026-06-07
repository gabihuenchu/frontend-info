'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { UsuarioService } from '@/services/usuario.service';
import { puedeVerLogistica } from '@/lib/logistics-permissions';
import DashboardPageHeader from '@/components/DashboardPageHeader';
import '@/styles/logistics.css';

interface LogisticsLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function LogisticsLayout({
  children,
  pageTitle = 'LOGÍSTICA',
  pageSubtitle = 'Centro Nacional de Coordinación Logística',
}: LogisticsLayoutProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (authLoading || !user) {
        setReady(false);
        return;
      }
      try {
        const token = await user.getIdToken();
        const p = await UsuarioService.getMyProfile(token);
        if (!puedeVerLogistica(p)) {
          router.replace('/dashboard/emergency');
          return;
        }
        setReady(true);
      } catch {
        router.replace('/login?next=/dashboard/logistica');
      }
    };
    void load();
  }, [user, authLoading, router]);

  if (authLoading || !ready) {
    return (
      <main className="dashboard-content-pane" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Cargando módulo logística…
      </main>
    );
  }

  const headerExtra = (
    <>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
          background: 'rgba(34, 197, 94, 0.12)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#4ade80',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
        Sistema Operativo
      </span>
      <button type="button" className="header-bell" title="Notificaciones">
        <Bell size={18} />
        <span className="bell-badge">3</span>
      </button>
    </>
  );

  return (
    <>
      <DashboardPageHeader title={pageTitle} subtitle={pageSubtitle} extra={headerExtra} />
      <main className="dashboard-content-pane">{children}</main>
    </>
  );
}
