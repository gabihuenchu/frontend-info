"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { getFirebaseAuthClient } from "@/services/firebaseClient";
import { useAuth } from "@/providers/AuthProvider";
import { UsuarioService } from "@/services/usuario.service";
import {
  puedeVerLogistica,
  puedeVerMatchingOsrm,
  puedeVerSeccionAdmin,
  formatearRolesUsuario,
  tienePermiso,
  type PerfilConPermisos,
} from "@/lib/logistics-permissions";
import { PERMISOS_LOGISTICA } from "@/types/logistics";
import { puedeGestionarCentros } from "@/lib/resources-permissions";
import {
  TriangleAlert,
  Warehouse,
  HandHeart,
  User,
  Moon,
  Sun,
  LogOut,
  Truck,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Route,
  GitBranch,
  Package,
  UserCog,
  HeartHandshake,
  ClipboardList,
  Gift,
} from "lucide-react";

interface SidebarProps {
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
}

type NavLink = {
  type: "link";
  icon: React.ReactNode;
  label: string;
  href: string;
  visible?: boolean;
  activeIconClass?: string;
};

type NavGroup = {
  type: "group";
  id: string;
  icon: React.ReactNode;
  label: string;
  visible?: boolean;
  children: Array<{ label: string; href: string; icon?: React.ReactNode; visible: boolean }>;
};

type NavItem = NavLink | NavGroup;

const LOGISTICA_PREFIX = "/dashboard/logistica";
const CIUDADANA_PREFIX = "/dashboard/ciudadana";

const LOGISTICA_SUB_ROUTES = [
  "/dashboard/logistica",
  "/dashboard/logistica/transferencias",
  "/dashboard/logistica/misiones",
  "/dashboard/logistica/rutas-voluntario",
  "/dashboard/logistica/matching-osrm",
];

export default function Sidebar({ dark, setDark }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PerfilConPermisos & { nombres?: string; apellidos?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    logistica: LOGISTICA_SUB_ROUTES.some(
      (r) => pathname === r || pathname.startsWith(`${r}/`)
    ),
    ciudadana: pathname.startsWith(CIUDADANA_PREFIX),
  });

  useEffect(() => {
    setOpenGroups((prev) => ({
      ...prev,
      logistica:
        LOGISTICA_SUB_ROUTES.some(
          (r) => pathname === r || pathname.startsWith(`${r}/`)
        ) || prev.logistica,
      ciudadana: pathname.startsWith(CIUDADANA_PREFIX) || prev.ciudadana,
    }));
  }, [pathname]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const token = await user.getIdToken();
        const p = await UsuarioService.getMyProfile(token);
        setProfile(p);
      } catch (error) {
        console.error("Error al obtener perfil del usuario:", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchUserProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      const auth = getFirebaseAuthClient();
      if (auth) await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
    router.push("/");
  };

  const userName = profile
    ? `${profile.nombres || ""} ${profile.apellidos || ""}`.trim()
    : "Cargando...";

  const userRole = formatearRolesUsuario(profile);

  const showLogistica = puedeVerLogistica(profile);
  const showAdmin = puedeVerSeccionAdmin(profile);

  const logisticaChildren = useMemo(
    () =>
      [
        {
          label: "Resumen logístico",
          href: "/dashboard/logistica",
          icon: <LayoutDashboard size={16} />,
          visible: showLogistica,
        },
        {
          label: "Transferencias",
          href: "/dashboard/logistica/transferencias",
          icon: <ArrowLeftRight size={16} />,
          visible:
            tienePermiso(profile, PERMISOS_LOGISTICA.SOLICITAR) ||
            tienePermiso(profile, PERMISOS_LOGISTICA.APROBAR),
        },
        {
          label: "Misiones",
          href: "/dashboard/logistica/misiones",
          icon: <Target size={16} />,
          visible: tienePermiso(profile, PERMISOS_LOGISTICA.MISION),
        },
        {
          label: "Rutas voluntario",
          href: "/dashboard/logistica/rutas-voluntario",
          icon: <Route size={16} />,
          visible: tienePermiso(profile, PERMISOS_LOGISTICA.RUTA),
        },
        {
          label: "Matching OSRM",
          href: "/dashboard/logistica/matching-osrm",
          icon: <GitBranch size={16} />,
          visible: puedeVerMatchingOsrm(profile),
        },
      ].filter((c) => c.visible),
    [profile, showLogistica]
  );

  const ciudadanaChildren = useMemo(
    () =>
      [
        {
          label: "Necesidades",
          href: "/dashboard/ciudadana/necesidades",
          icon: <ClipboardList size={16} />,
          visible: true,
        },
        {
          label: "Donaciones",
          href: "/dashboard/ciudadana/donaciones",
          icon: <Gift size={16} />,
          visible: true,
        },
      ].filter((c) => c.visible),
    []
  );

  const menuItems: NavItem[] = [
    {
      type: "link" as const,
      icon: <UserCog size={18} />,
      label: "Gestión Usuarios",
      href: "/dashboard/usuarios",
      visible: showAdmin,
    },
    {
      type: "link" as const,
      icon: <TriangleAlert size={18} />,
      label: "Emergencias",
      href: "/dashboard/emergency",
      activeIconClass: "alert",
    },
    {
      type: "link" as const,
      icon: <Warehouse size={18} />,
      label: "Centros de acopio",
      href: "/dashboard/logistica/centros-acopio",
      visible: puedeGestionarCentros(profile),
    },
    ...(showLogistica && logisticaChildren.length > 0
      ? [
          {
            type: "group" as const,
            id: "logistica",
            icon: <Truck size={18} />,
            label: "Logística",
            children: logisticaChildren,
          },
        ]
      : []),
    ...(showLogistica || showAdmin
      ? [
          {
            type: "link" as const,
            icon: <Package size={18} />,
            label: "Inventario",
            href: "/dashboard/logistica/inventario",
          },
        ]
      : []),
    ...(ciudadanaChildren.length > 0
      ? [
          {
            type: "group" as const,
            id: "ciudadana",
            icon: <HeartHandshake size={18} />,
            label: "Gestión Ciudadana",
            children: ciudadanaChildren,
          },
        ]
      : []),
  ].filter((item) => item.visible !== false);

  const isPathActive = (href: string) => {
    if (href === "/dashboard/logistica") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isGroupActive = (groupId: string) => {
    if (groupId === "logistica") {
      return LOGISTICA_SUB_ROUTES.some((r) => isPathActive(r));
    }
    if (groupId === "ciudadana") {
      return pathname.startsWith(CIUDADANA_PREFIX);
    }
    return false;
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <aside className="sidebar sidebar--app">
      <div className="sidebar--app-inner">
        <div className="sidebar--app-logo">
          <div className="sidebar--app-logo-icon">CL</div>
          <h1 className="sidebar--app-logo-text">
            CATÁSTROFES
            <span className="brand-green">CL</span>
          </h1>
        </div>

        <nav className="sidebar-nav sidebar-nav--app">
          {menuItems.map((item) => {
            if (item.type === "group") {
              const groupActive = isGroupActive(item.id);
              const isOpen = openGroups[item.id] ?? false;

              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.id)}
                    className={`nav-item nav-item--app${groupActive ? " active" : ""}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
                    {isOpen ? (
                      <ChevronDown size={16} style={{ color: "#6b7280" }} />
                    ) : (
                      <ChevronRight size={16} style={{ color: "#6b7280" }} />
                    )}
                  </button>
                  {isOpen && (
                    <div style={{ marginTop: 2, marginBottom: 4 }}>
                      {item.children.map((child) => (
                        <button
                          key={child.href}
                          type="button"
                          onClick={() => router.push(child.href)}
                          className={`nav-sub-item${isPathActive(child.href) ? " active" : ""}`}
                        >
                          {child.icon}
                          <span>{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            const active = isPathActive(item.href);
            const iconClass =
              active && item.activeIconClass === "alert"
                ? "nav-icon nav-icon--alert"
                : "nav-icon";

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => router.push(item.href)}
                className={`nav-item nav-item--app${active ? " active" : ""}`}
              >
                <span className={iconClass}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar--app-widget sidebar--app-widget--status">
          <p className="sidebar--app-widget-label">Sistema en tiempo real</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="status-dot" />
            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#4ade80" }}>Conectado</span>
          </div>
        </div>

        <div className="sidebar--app-widget sidebar--app-widget--help">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ marginTop: 2, color: "var(--green-brand-text)" }}>
              <HandHeart size={18} />
            </div>
            <div>
              <p className="sidebar--app-widget-title">Tu ayuda marca la diferencia.</p>
              <p className="sidebar--app-widget-sub">Infórmate, colabora y salva vidas.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="sidebar--app-user">
        <div className="sidebar--app-user-row">
          <div className="sidebar--app-avatar">
            <User size={20} />
          </div>
          <div className="sidebar--app-user-info">
            <p className="sidebar--app-user-name">{loading ? "…" : userName}</p>
            <p className="sidebar--app-user-role">{userRole}</p>
          </div>
          <button
            type="button"
            onClick={() => setDark((prev) => !prev)}
            className="sidebar--app-icon-btn"
            title="Cambiar tema"
          >
            {dark ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="sidebar--app-icon-btn sidebar--app-icon-btn--logout"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
