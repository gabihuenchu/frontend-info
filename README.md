# Frontend Info - CatástrofesCL

Portal ciudadano para la gestión de recursos humanitarios en catástrofes naturales en Chile.

## Tecnologías

- Next.js 14+ con App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Firebase Auth

## Estructura

```
frontend-info/
|-- app/                 # App Router (Next.js 14)
|-- components/
|   |-- ui/              # Componentes shadcn/ui
|   -- {feature}/        # Componentes de dominio
|-- lib/
|   |-- api/             # Funciones de fetch
|   |-- queries/         # Hooks TanStack Query
|   |-- schemas/         # Schemas Zod
|   -- utils/
|-- hooks/               # Hooks personalizados
|-- types/               # Tipos TypeScript
`-- public/
```

## Branding

### Colores
- Verde Oscuro: #2B3210
- Blanco Cremoso: #FBF8EF
- Rojo: #DE6E27
- Azul Grisáceo: #E5E2D9
- Verde Oliva: #505631

### Tipografías
- Intro Rust: Títulos destacados
- Vertical Serif: Elementos específicos
- Helvetica Now: Texto general

## Flujo de Trabajo

Este repositorio utiliza Gitflow:
- `main`: Rama de producción
- `develop`: Rama de desarrollo
- `feature/*`: Nuevas funcionalidades
- `hotfix/*`: Correcciones urgentes

## Instalación

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```
