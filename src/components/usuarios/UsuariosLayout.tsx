'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { getMyProfile } from '@/services/usuario.service';
import { puedeGestionarUsuarios } from '@/lib/logistics-permissions';
import DashboardPageHeader from '@/components/DashboardPageHeader';
import '@/styles/usuarios.css';

interface UsuariosLayoutProps {
  children: React.ReactNode;
}

export default function UsuariosLayout({ children }: UsuariosLayoutProps) {
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
        const profile = await getMyProfile();
        if (!puedeGestionarUsuarios(profile)) {
          router.replace('/dashboard/emergency');
          return;
        }
        setReady(true);
      } catch {
        router.replace('/login?next=/dashboard/usuarios');
      }
    };
    void load();
  }, [user, authLoading, router]);

  if (authLoading || !ready) {
    return (
      <main className="dashboard-content-pane usuarios-loading">
        Cargando gestión de usuarios…
      </main>
    );
  }

  const headerExtra = (
    <span className="usuarios-header-pill">
      <Shield size={14} />
      Solo administradores
    </span>
  );

  return (
    <>
      <DashboardPageHeader
        title="GESTIÓN DE USUARIOS"
        subtitle="Usuarios, roles y permisos del sistema"
        extra={headerExtra}
      />
      <main className="dashboard-content-pane">{children}</main>
    </>
  );
}
