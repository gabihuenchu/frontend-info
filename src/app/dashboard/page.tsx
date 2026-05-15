import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard - CatástrofesCL",
  description: "Panel de control del sistema de emergencias",
};

export default function DashboardPage() {
  // Redirigir automáticamente al dashboard de emergencias
  redirect("/dashboard/emergency");
}
