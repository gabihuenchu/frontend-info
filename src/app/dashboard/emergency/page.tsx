import type { Metadata } from "next";
import PaginaEmergencias from "./PaginaEmergencias";

export const metadata: Metadata = {
  title: "Dashboard de Emergencias - CatástrofesCL",
  description: "Monitoreo y gestión de emergencias en tiempo real",
};

export default function EmergencyPage() {
  return <PaginaEmergencias />;
}