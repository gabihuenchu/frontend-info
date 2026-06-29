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

## Variables de entorno

El frontend consume por defecto la API Gateway en `http://localhost:8080`.

Para autenticar con Firebase Auth en login, configura estas variables en `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

## Build

```bash
npm run build
npm start
```

## AWS / DevOps (rama `aws`)

| Recurso | Nombre |
|---------|--------|
| Repositorio GitHub | [gabihuenchu/frontend-info](https://github.com/gabihuenchu/frontend-info) |
| Rama de despliegue | `aws` |
| Imagen ECR | `catastrofescl/frontend-info:latest` |
| Puerto contenedor | `3000` |
| Workflow | `.github/workflows/docker-aws.yml` |

### Secrets en GitHub Actions

**AWS (laboratorio Vocareum):**

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`
- `AWS_REGION` (ej. `us-east-1`)

**Build del frontend** (se incrustan en el bundle en tiempo de build):

- `NEXT_PUBLIC_API_URL` — URL del API Gateway en AWS (ej. `http://IP_ALB:8080`)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (opcional)

Crear repositorio ECR:

```bash
aws ecr create-repository --repository-name catastrofescl/frontend-info
```
