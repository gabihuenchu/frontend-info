/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  // Soluciona problemas de cross-origin en desarrollo
  allowedDevOrigins: ['192.168.1.18', 'localhost:3000'],
  async rewrites() {
    // En contenedor el proxy server-side debe apuntar al gateway por su nombre
    // de servicio (API_GATEWAY_INTERNAL_URL); en local cae a localhost:8080.
    const gateway = process.env.API_GATEWAY_INTERNAL_URL || 'http://localhost:8080';
    return [
      {
        // Intercepta todas las llamadas a /api/*
        source: '/api/:path*',
        // Las redirige al MS-Api-Gateway que es el orquestador
        destination: `${gateway}/:path*`,
      }
    ];
  },
}

module.exports = nextConfig
