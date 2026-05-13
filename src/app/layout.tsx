import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CatástrofesCL - Portal de Emergencias",
  description: "Portal ciudadano para la gestión de recursos humanitarios en catástrofes naturales en Chile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ReactQueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
