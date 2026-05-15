"use client";

import {
  Home,
  TriangleAlert,
  Warehouse,
  Boxes,
  FileText,
  Map,
  Users,
  CircleHelp,
  HandHeart,
  User,
  Moon,
  Sun,
} from "lucide-react";

interface SidebarProps {
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
  userName?: string;
  userRole?: string;
}

export default function Sidebar({ 
  dark, 
  setDark, 
  userName = "Usuario", 
  userRole = "Sin rol" 
}: SidebarProps) {
  const menuItems = [
    {
      icon: <Home size={18} />,
      label: "Inicio",
      active: false,
    },
    {
      icon: <TriangleAlert size={18} />,
      label: "Emergencias",
      active: true,
    },
    {
      icon: <Warehouse size={18} />,
      label: "Centros de acopio",
      active: false,
    },
    {
      icon: <Boxes size={18} />,
      label: "Recursos",
      active: false,
    },
    {
      icon: <FileText size={18} />,
      label: "Reportes",
      active: false,
    },
    {
      icon: <Map size={18} />,
      label: "Mapas",
      active: false,
    },
    {
      icon: <Users size={18} />,
      label: "Voluntarios",
      active: false,
    },
    {
      icon: <CircleHelp size={18} />,
      label: "Ayuda",
      active: false,
    },
  ];

  return (
    <aside className="w-[280px] h-screen bg-[#10170D] border-r border-white/5 flex flex-col px-5 py-6 text-white overflow-hidden">

      {/* LOGO */}
      <div className="flex-shrink-0">

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#2B3210] flex items-center justify-center font-bold text-white border border-[#3f4d22]">
            CL
          </div>

          <h1 className="text-lg font-bold tracking-wide">
            CATÁSTROFES
            <span className="text-[#8BAE5A]">CL</span>
          </h1>
        </div>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto min-h-0">

          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-xl
                transition-all duration-200
                text-sm font-medium
                ${
                  item.active
                    ? "bg-[#2B3210] text-white shadow-lg"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <span
                className={`${
                  item.active ? "text-red-500" : "text-gray-400"
                }`}
              >
                {item.icon}
              </span>

              <span>{item.label}</span>
            </button>
          ))}

        </nav>

        {/* STATUS */}
        <div className="mt-4 bg-[#161F12] border border-[#2f3a22] rounded-xl p-3 flex-shrink-0">

          <p className="text-xs text-gray-400 mb-2">
            Sistema en tiempo real
          </p>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

            <span className="text-sm font-medium text-green-400">
              Conectado
            </span>
          </div>

        </div>

        {/* HELP CARD */}
        <div className="mt-3 bg-gradient-to-br from-[#1A2414] to-[#141B10] border border-[#2f3a22] rounded-xl p-3 flex-shrink-0">

          <div className="flex items-start gap-2">

            <div className="mt-0.5 text-[#8BAE5A]">
              <HandHeart size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-white leading-tight">
                Tu ayuda marca la diferencia.
              </p>

              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Infórmate, colabora y salva vidas.
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* USER */}
      <div className="border-t border-white/5 pt-4 mt-4 flex-shrink-0">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-full bg-[#2B3210] border border-[#3f4d22] flex items-center justify-center text-white">
            <User size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {userName}
            </p>

            <p className="text-xs text-gray-400">
              {userRole}
            </p>
          </div>

          {/* Toggle simple */}
          <button
            onClick={() => setDark((prev) => !prev)}
            className="w-10 h-10 rounded-xl bg-[#1A2414] border border-[#2f3a22] hover:bg-[#24301B] transition-colors"
          >
            {dark ? <Moon size={18} /> : <Sun size={18} />}
          </button>

        </div>

      </div>
    </aside>
  );
}