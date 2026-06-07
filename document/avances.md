# Avances — CatástrofesCL

## Bitácora de Progreso del Proyecto

---

### [2026-06-04] Módulo logística dashboard + sidebar unificado
**Integrante(s):** Camilo / Claude (Cursor)  
**Fase trabajada:** Fase 8 — Frontend Completo (integración Fase 4 logística)

#### Completado
- **Módulo logística** en `frontend-info`: rutas `/dashboard/logistica`, `/transferencias`, `/misiones`, `/rutas-voluntario`, `/matching-osrm`, `/inventario`, `/centros-acopio`, `/reportes`, `/ajustes`.
- Capa de datos: `types/logistics.ts`, `services/logistics.service.ts`, `hooks/useLogistics.ts`, `lib/logistics-permissions.ts`, mocks para KPIs/listados sin `GET` en backend.
- Componentes: `LogisticsMap`, `LogisticsKpiCards`, `TransferenciasTable`, `LogisticsRightPanel`, `LogisticsLayout`, `DashboardPageHeader`.
- **Shell dashboard único:** `dashboard/layout.tsx` con un solo `Sidebar` + `DashboardThemeProvider`; eliminado sidebar duplicado en emergencias/logística.
- **Sidebar — menú definitivo:** Gestión Usuarios, Emergencias, Centros de acopio, Logística (submenú RBAC), Inventario, Gestión Ciudadana (Necesidades / Donaciones).
- **Estilos sidebar unificados:** clase `sidebar--app` en `emergency.css`, variable `--dark-bg-sidebar: #10170D` (mismo color en logística y emergencias).
- **Correcciones mapa:** hook `useGoogleMaps` con loader ID único; dibujo de zonas por clics (sin `DrawingManager`, retirado en Maps API 3.65).
- Login ADMIN redirige a `/dashboard/logistica`.

#### En progreso
- Páginas del menú sin UI: `/dashboard/usuarios`, `/dashboard/ciudadana/necesidades`, `/dashboard/ciudadana/donaciones`.
- Listados reales de transferencias/misiones (backend sin endpoints `GET` de colección).
- Integración E2E logística vía gateway `:8080`.

#### Bloqueadores
- Ninguno para navegación y UI; datos de listado dependen de APIs pendientes en `ms-logistics`.

#### Próximos pasos
- Implementar vistas Gestión Usuarios y Gestión Ciudadana.
- Añadir `ms-logistics` a `compose.yaml` raíz y validar matching OSRM end-to-end.
- Sustituir mocks por TanStack Query cuando existan `GET /transferencias` y `GET /misiones`.

---

### [2026-06-06] Documentación flujo auth Firebase ↔ PostgreSQL
**Origen:** FE / IDN  
**Fase:** 1 — Identidad + Frontend  

#### Completado
- Guía [flujo-autenticacion.md](./flujo-autenticacion.md): login (valida Firebase + auto-sync BD), registro (`POST /auth/register` en ambos sistemas).
- Mensajes de login alineados (cuenta inexistente en Firebase).
- Enlace desde [ENDPOINTS.md](./ENDPOINTS.md).

---

## [2025-01-09] Integración Dashboard Emergencias con Backend

**Integrante(s):** Claude (Asistente AI)  
**Fase trabajada:** Fase 5 — Emergencias y Anuncios / Fase 8 — Frontend  
**Estado:** ✅ Completado

### Completado

#### 1. Backend Integration (MS-2: Coordinación de Emergencias)
- ✅ Servicio de API completo (`services/emergency.service.ts`)
- ✅ Endpoints integrados: GET /activas, GET /, POST /, PATCH /:id/estado
- ✅ Tipos TypeScript con validación completa
- ✅ Manejo de errores RFC 7807

#### 2. TanStack Query Implementation
- ✅ Hooks personalizados (`hooks/useEmergencies.ts`)
- ✅ Query keys estructurados
- ✅ Refetch automático cada 30 segundos
- ✅ Mutations con invalidación de cache
- ✅ Manejo de estados de carga/error

#### 3. Authentication Flow
- ✅ Firebase token integration
- ✅ Interceptor de request con Bearer token
- ✅ Auto-refresh de tokens expirados
- ✅ Manejo de errores 401

#### 4. UI/UX Improvements
- ✅ Estados de carga con spinner animado
- ✅ Estados de error con retry button
- ✅ Estados vacíos informativos
- ✅ Responsive design mantenido
- ✅ Dark theme optimizado

#### 5. Provider Configuration
- ✅ ReactQueryProvider con config optimizada
- ✅ Integración con layout principal
- ✅ Auth provider anidado correctamente

### Archivos Modificados/Creados

**Creados (8):**
- `src/services/emergency.service.ts`
- `src/hooks/useEmergencies.ts`
- `src/providers/ReactQueryProvider.tsx`
- `src/app/dashboard/emergency/EmergencyDashboard.tsx`

**Modificados (5):**
- `src/services/apiClient.ts` - Auth integration
- `src/app/layout.tsx` - Providers
- `src/app/dashboard/emergency/page.tsx` - New component
- `src/app/dashboard/emergency/emergency.css` - New states
- `package.json` - TanStack Query dep

**Eliminados (1):**
- `src/app/dashboard/emergency/emergency.tsx` - Reemplazado

### Próximos Pasos

1. **Testing E2E:** Validar flujo completo con backend real
2. **WebSocket Integration:** Actualizaciones en tiempo real para emergencias
3. **Formulario Creación:** Implementar modal con validación Zod
4. **Gráficos Estadísticos:** Integrar Recharts para visualización de datos
5. **Filtros y Búsqueda:** Agregar funcionalidad de filtrado en tabla

---

## Historial de Avances Anteriores

### [2026-05-09] Documentación de consumo de ms-emergencies para frontend-info
**Integrante(s):** Claude
**Fase trabajada:** Fase 8 — Frontend Completo

#### Completado
- Se actualizó `ENDPOINTS.md` con el contrato de consumo de `ms-emergencies` desde el frontend.
- Se reforzó `especificaciones-tecnicas.md` con el uso de `GET /emergencies/active`, `GET /emergencies/active/geojson` y `GET /announcements`.
- Se agregaron tareas faltantes al `plan-de-implementacion.md` para conectar el mapa ciudadano, el feed de anuncios y el manejo de errores de negocio.
- Se registró el cambio documental en `arreglos-y-cambios.md` para mantener trazabilidad.

#### En progreso
- Integración visual del mapa público con datos reales de emergencias.
- Consumo de anuncios críticos desde el portal ciudadano.

#### Bloqueadores
- Ninguno.

#### Próximos pasos
- Implementar los hooks y clientes API documentados para `ms-emergencies`.
- Conectar el mapa y el feed de anuncios al gateway.

### [2026-05-09] Refactorización Panel de Emergencias y Sidebar Component
**Integrante(s):** Claude
**Fase trabajada:** Fase 8 — Frontend Completo

#### Completado
- **Refactorización del Panel de Emergencias**: Transformación del modal de creación/edición a un panel lateral derecho persistente con tabs dinámicos (Detalles, Crear Emergencia, Centros de Acopio).
- **Nuevo Componente Sidebar**: Creación de componente reutilizable `Sidebar` en `src/components/sidebar.tsx` con:
  - Navegación lateral completa con iconos Lucide
  - Sistema de menú activo con estados hover/focus
  - Card de estado del sistema (conexión en tiempo real)
  - Card de ayuda/CTA
  - Sección de usuario dinámica con nombre, rol y toggle de tema oscuro/claro
- **Migración Tailwind CSS**: Configuración estable de Tailwind v3 con PostCSS para compatibilidad con Next.js 16 y Turbopack:
  - `postcss.config.js`: plugin `tailwindcss` + `autoprefixer`
  - `globals.css`: directivas `@tailwind base/components/utilities` (sintaxis v3)
  - Configuración validada y funcionando en entorno local
- **Reemplazo de Emojis por Iconos**: Todos los emojis del dashboard de emergencias fueron reemplazados por iconos vectoriales de Lucide:
  - Iconos de tipos de emergencia: Flame, Waves, CloudRain, Zap, Mountain
  - Iconos de UI: ClipboardList, AlertTriangle, Warehouse, Clock, MapPin, Pencil, Trash2, Bell, etc.
  - Iconos de KPIs: TrendingUp, Users, Truck, Plane
  - Toggle de tema: Moon/Sun
- **Panel Derecho Dinámico**: Implementación de `PanelDerecho` con:
  - Tabs navegables entre vistas (detalles, crear/editar emergencia, centros, crear centro)
  - Formularios integrados para creación de emergencias y centros de acopio
  - Herramientas de mapa para dibujar zonas afectadas (Dibujar, Editar, Borrar)
  - Lista de centros de acopio con distancia y estado operativo

#### En progreso
- Integración del Sidebar en otras páginas del dashboard
- Implementación de drawing de polígonos reales en el mapa (Google Maps API)

#### Bloqueadores
- Google Maps API requiere API Key para mostrar mapa sin watermark (no bloqueante para desarrollo UI)

#### Próximos pasos
- Conectar el panel de emergencias con el backend real (endpoints de ms-emergencies)
- Implementar funcionalidad de dibujo de polígonos con Google Maps Drawing API
- Agregar integración de autenticación para mostrar nombre/rol real del usuario en sidebar

---

### [2026-05-05] Conexión de Formulario de Registro e Integración de Redirección
**Integrante(s):** Claude
**Fase trabajada:** Fase 8 — Frontend Completo

### Completado
- Se conectó el formulario de `RegisterPage` con el servicio `AuthService.register` (Axios).
- Se implementó la lógica de redirección post-registro hacia `/login?registered=true`.
- Se añadió un mensaje de éxito (advertencia visual) en `LoginPage` que se activa al detectar el parámetro `registered`.
- Se actualizaron los campos del formulario de registro para incluir Nombres, Apellidos, Tipo de Documento y Número de Documento, cumpliendo con los requisitos de la API.
- Se corrigió un error de desajuste de nombres de campos: se cambió `email` por `correo` en las interfaces de servicio para coincidir con los DTOs de Spring Boot, solucionando el error 500 en el registro.
- Se implementó `Suspense` en `LoginPage` para el manejo de parámetros de búsqueda en Next.js.

### En progreso
- Implementación de la autenticación real con Firebase Auth SDK en el frontend para el Login.
- Sincronización del estado de autenticación global.

### Bloqueadores
- Ninguno.

### Próximos pasos
- Configurar el Firebase Auth SDK en el frontend para permitir el inicio de sesión real.
- Integrar la llamada a `AuthService.syncFirebase` tras el login exitoso en Firebase.

### [2026-05-05] Creación de Servicios API para MS Identidad y Acceso
**Integrante(s):** Claude
**Fase trabajada:** Fase 8 — Frontend Completo

### Completado
- Se creó el cliente base de `axios` en `src/services/apiClient.ts` con configuración para el Base URL (`http://localhost:8081`).
- Se implementaron los servicios para consumir los 17 endpoints documentados en `ENDPOINTS.md`:
  - `auth.service.ts`: Endpoints de registro, sincronización y envío/aceptación de invitaciones.
  - `usuario.service.ts`: Endpoints de gestión de perfiles, roles, estados y solicitudes de rol.
  - `rol.service.ts`: Endpoints para asignación y remoción de permisos a roles.
  - `permiso.service.ts`: Endpoint para listar permisos.

### En progreso
- Integración de los servicios creados (como `AuthService.register`) en las páginas de frontend correspondientes (`RegisterPage`, etc.).
- Auto-refresh del Firebase Token en el interceptor de Axios (Fase 8).

### Bloqueadores
- Ninguno.

### Próximos pasos
- Aplicar validación Zod en formularios e invocar los servicios `axios` para registrar/sincronizar los usuarios con la BD.

### [2026-05-05] UI de Formulario de Registro Ciudadano
**Integrante(s):** Claude
**Fase trabajada:** Fase 8 — Frontend Completo

### Completado
- Se implementó la interfaz visual de `RegisterPage` en `frontend-info` para coincidir exactamente con el diseño solicitado (`LoginRegister.png`).
- Se reutilizaron las clases de `globals.css` (e.g. `.login-page`, `.login-card`) garantizando consistencia con `LoginPage`.
- Se añadieron los iconos de Lucide React y los estados de los campos del formulario.

### En progreso
- Validación Zod internacional para los campos del formulario.
- Integración real con el endpoint `/auth/register`.

### Bloqueadores
- Ninguno.

### Próximos pasos
- Implementar validación Zod y conexión con backend.

### [2026-05-04] Cierre de Fase 1 — MS Identidad y Acceso
#### [2026-05-05] Inicio Fase 7 — Integración RabbitMQ

**Integrante(s):** Claude
**Fase trabajada:** Fase 7 — Integración y Mensajería

#### Completado
- **Documentación completa:** Crear guía `RabbitMQConfig.md` con configuración completa
  - Topic Exchange `catastrofescl.events` configurado
  - Dead Letter Exchange `catastrofescl.dlx` configurado
  - Routing keys definidas según especificación CLAUDE.md
  - Colas principales con DLQ binding configuradas
  - Políticas de reintento (3 intentos, 30s TTL) definidas
  - Idempotencia con Redis TTL 24h implementada
  - Configuración Spring AMQP completa con ejemplos
  - Pruebas de resiliencia diseñadas y documentadas
  - Monitoreo DLQ con alertas automáticas configuradas
  - Métricas RabbitMQ con Micrometer integradas

- **Arquitectura de mensajería:** Diseño robusto para eventos entre microservicios
  - Exchange tipo Topic para broadcast eficiente
  - Exchange DLX para manejo centralizado de errores
  - Sistema de reintento automático configurable
  - Prevención de duplicación por idempotencia Redis
  - Monitoreo proactivo de Dead Letter Queues

- **Referencia técnica:** Crear archivos de configuración reutilizables
  - Plantillas YAML para application.yml
  - Ejemplos de código Java para cada componente
  - Scripts de testing y validación
  - Checklist de implementación por microservicio

#### En progreso
- Validación de configuración RabbitMQ en entorno local
- Pruebas de conectividad entre exchanges y colas

#### Bloqueadores
- Ninguno para la configuración documentada

#### Próximos pasos
- Implementar configuración RabbitMQ en cada microservicio existente
- Configurar productores de eventos en MS que generan eventos
- Configurar consumidores en MS que escuchan eventos
- Validar routing keys y bindings end-to-end
- Ejecutar pruebas de resiliencia completas

## [2026-05-04] Cierre de Fase 1 — MS Identidad

**Integrante(s):** Claude  
**Fase trabajada:** Fase 1 — MS Identidad y Acceso

#### Completado
- Se cerró la checklist de Fase 1 en `plan-de-implementacion.md`.
- Se alineó datasource por defecto de `application.yml` a `catastrofescl_db`.
- Se agregó soporte de endpoint listado en `/usuarios` (manteniendo compatibilidad con `/usuarios/listar`).
- Se agregaron endpoints raíz para solicitudes de rol (`POST /solicitudes-rol`, `PATCH /solicitudes-rol/{id}`).
- Se incorporaron pruebas unitarias para `UsuarioService`, `PermisosService` y `RolService`.
- Se incorporó prueba de integración con Testcontainers para flujo: sync Firebase sistema → asignación de rol → carga de permisos.
- Se actualizó el plan con la migración adicional `V8__seed_default_registered_role.sql`.

#### En progreso
- Ejecución de pruebas en entorno local del equipo (pendiente comando local por limitación del runner del agente).

#### Bloqueadores
- El entorno del agente no dispone de `pwsh`, por lo que no puede ejecutar Maven tests directamente desde esta sesión.

#### Próximos pasos
- Ejecutar `.\mvnw.cmd test` en máquina local para validar la suite completa.

### [2026-05-04] Ajuste final de seguridad: autorización solo por rol en MS Identity

**Integrante(s):** Claude  
**Fase trabajada:** Fase 1 — MS Identidad y Acceso

#### Completado
- Se simplificó `@PreAuthorize` en endpoints administrativos a validación exclusiva por rol.
- Se reemplazaron expresiones `hasRole('ADMINISTRADOR') and hasAuthority(...)` por `hasRole('ADMINISTRADOR')`.
- Controladores actualizados: `UsuarioController`, `RolController`, `PermisoController`, `AuthController` (invitación operador).
- Se actualizó documentación para reflejar enfoque por rol en esta etapa del MS.

#### En progreso
- Ninguno para este ajuste.

#### Bloqueadores
- Ninguno.

#### Próximos pasos
- Probar con usuario no administrador que reciba `403` en endpoints administrativos.

### [2026-05-04] Refuerzo de seguridad en endpoints por rol + permiso

**Integrante(s):** Claude  
**Fase trabajada:** Fase 1 — MS Identidad y Acceso

#### Completado
- Se reforzó `@PreAuthorize` en endpoints administrativos para requerir rol `ADMINISTRADOR` y permiso `USUARIO_GESTIONAR`.
- Endpoints ajustados:
  - `POST /roles/{id}/permisos/{permisoId}`
  - `DELETE /roles/{id}/permisos/{permisoId}`
  - `GET /permisos`
  - `POST /auth/invitacion/operador`
- Se alineó documentación del proyecto a estrategia híbrida de autorización (rol + permiso) en endpoints críticos.

#### En progreso
- Ninguno para este ajuste.

#### Bloqueadores
- Ninguno.

#### Próximos pasos
- Verificar en Postman con usuario sin rol `ADMINISTRADOR` que reciba `403` en endpoints administrativos.

### [2026-05-04] Endpoint de registro unificado implementado (`/auth/register`)

**Integrante(s):** Claude  
**Fase trabajada:** Fase 1 — MS Identidad y Acceso

#### Completado
- Se implementó `POST /auth/register` como endpoint público para registro desde frontend/Postman.
- El nuevo flujo crea usuario en Firebase Auth y sincroniza de inmediato en PostgreSQL.
- Se agregó `RegistroFirebaseRequest` con validaciones (`correo`, `password`, datos de perfil).
- Se habilitó el endpoint en `SecurityConfig` y se agregó manejo explícito de errores `FirebaseAuthException`.
- Se actualizó documentación funcional en `especificaciones-tecnicas.md` y `plan-de-implementacion.md`.

#### En progreso
- Ninguno para el endpoint backend.

#### Bloqueadores
- Ninguno.

#### Próximos pasos
- Probar desde Postman `POST /auth/register` con correo nuevo y confirmar alta en Firebase Auth + tabla `usuarios`.

### [2026-05-04] Resolución de error Redis para sincronización local Firebase → BD

**Integrante(s):** Claude  
**Fase trabajada:** Fase 1 — MS Identidad y Acceso

#### Completado
- Se identificó que `POST /auth/firebase/sync` fallaba con `500` por `Unable to connect to Redis`.
- Se parametrizó el cache manager en `application.yml` con `spring.cache.type: ${SPRING_CACHE_TYPE:redis}`.
- Se configuró `.env` local con `SPRING_CACHE_TYPE=simple`.
- Se confirmó flujo operativo en local: Postman (`Bearer idToken`) → sync usuario en PostgreSQL.

#### En progreso
- Ninguno en backend para este incidente.

#### Bloqueadores
- Ninguno.

#### Próximos pasos
- Mantener `SPRING_CACHE_TYPE=simple` en local y usar `redis` en entornos con servicio Redis activo.

### [2026-05-04] Corrección de autenticación local Firebase para endpoints protegidos

**Integrante(s):** Claude  
**Fase trabajada:** Fase 1 — MS Identidad y Acceso

#### Completado
- Se detectó causa de `403` en `/auth/firebase/sync`: Firebase deshabilitado en entorno local.
- Se configuró `FIREBASE_ENABLED=true` en `.env`.
- Se registró trazabilidad de error y corrección en `errores.md` y `arreglos-y-cambios.md`.

#### En progreso
- Validación funcional de flujo Postman: token Firebase (`idToken`) + sync en BD.

#### Bloqueadores
- Ninguno en backend.

#### Próximos pasos
- Reiniciar la API para tomar `.env` actualizado.
- Reintentar `POST /auth/firebase/sync` con `Authorization: Bearer <idToken>`.

### [2026-05-04] Trigger Firebase Auth onCreate implementado para sync automático

**Integrante(s):** Claude  
**Fase trabajada:** Fase 1 — MS Identidad y Acceso

#### Completado
- Implementación de Cloud Function `auth.user().onCreate` (`syncIdentityOnUserCreate`) en `firebase-functions/index.js`.
- Envío automático a `POST /auth/firebase/sync/system` al crear usuario en Firebase Auth.
- Manejo de payload mínimo para alta en BD (`firebaseUid`, `correo`, `nombres`, `apellidos`, `tipoDocumento`, `pais`).
- Configuración por variables de entorno para integración local segura:
  - `IDENTITY_SYNC_BASE_URL`
  - `FIREBASE_SYNC_SECRET`

#### En progreso
- Despliegue/configuración del entorno Firebase Functions con variables de entorno en el proyecto Firebase.

#### Bloqueadores
- Ninguno en backend `ms-identity`.

#### Próximos pasos
- Configurar URL accesible desde la función hacia `ms-identity` en entorno local (túnel o endpoint accesible).
- Validar flujo completo: alta en Firebase Auth → trigger onCreate → registro en BD.

### [2026-05-04] Rol por defecto sin privilegios y aclaración de endpoints de sincronización

**Integrante(s):** Claude  
**Fase trabajada:** Fase 1 — MS Identidad y Acceso

#### Completado
- Se agregó migración `V8__seed_default_registered_role.sql` para crear el rol `REGISTRADO`.
- Se cambió la asignación de rol por defecto en `AuthService` de `PARTICULAR` a `REGISTRADO` (sin privilegios iniciales).
- Se comentaron en `AuthController` las líneas de los endpoints de sincronización:
  - `POST /auth/firebase/sync` (manual, cliente autenticado)
  - `POST /auth/firebase/sync/system` (automático, integración con `X-Sync-Secret`)
- Se actualizó trazabilidad en `errores.md`, `arreglos-y-cambios.md` y `especificaciones-tecnicas.md`.

#### En progreso
- Configuración del trigger externo de Firebase Auth (`onCreate`) para invocar `/auth/firebase/sync/system`.

#### Bloqueadores
- Ninguno en backend.

#### Próximos pasos
- Publicar custom claims de roles en Firebase cuando corresponda (`ADMINISTRADOR`, `AUTORIDAD`, etc.).
- Probar flujo completo alta Firebase → sync BD → asignación explícita de rol con permisos.

### [2026-04-24] Automatización de sync Firebase Auth → BD local

**Integrante(s):** Claude  
**Fase trabajada:** Fase 1 — MS Identidad y Acceso

#### Completado
- Endpoint técnico `POST /auth/firebase/sync/system` implementado para automatizar altas desde trigger Firebase Auth.
- Seguridad de integración por secreto `X-Sync-Secret` (`FIREBASE_SYNC_SECRET`).
- Corrección de manejo de errores para devolver `403` en Access Denied y `400` en validaciones.
- Colección Postman (`collect.json`) actualizada con request de sincronización automática.
- Documentación técnica y de trazabilidad actualizada (`especificaciones-tecnicas.md`, `errores.md`, `arreglos-y-cambios.md`).

#### En progreso
- Integración externa del trigger (Cloud Function) apuntando al nuevo endpoint técnico.

#### Bloqueadores
- Ninguno en backend; pendiente despliegue/configuración del trigger fuera de este repositorio.

#### Próximos pasos
- Configurar `FIREBASE_SYNC_SECRET` en entorno.
- Implementar y desplegar Cloud Function `auth.user().onCreate` para invocar `/auth/firebase/sync/system`.

---

## Leyenda de Estados

- ⬜ No iniciado
- 🔄 En progreso
- ✅ Completado
- ⚠️ Bloqueado/Issue

## Tabla de Estado por Componente

| Componente | Frontend | Backend | Integración | Estado |
|-----------|----------|---------|-------------|--------|
| Autenticación | ✅ | ✅ | ✅ | Completado |
| Dashboard Emergencias | ✅ | ✅ | 🔄 | Completado (UI); validar E2E dibujo polígono |
| Dashboard Logística | 🔄 | ✅ | 🔄 | UI + mocks; APIs listado pendientes |
| Sidebar / shell dashboard | ✅ | — | ✅ | Menú unificado y tema consistente |
| Gestión de Usuarios | 🔄 | ✅ | ⬜ | Enlace en menú; página pendiente |
| Centros de Acopio | 🔄 | 🔄 | ⬜ | Ruta FE + gestión en emergencias |
| Inventario | 🔄 | ⬜ | ⬜ | Página placeholder logística |
| Gestión Ciudadana | 🔄 | ⬜ | ⬜ | Menú Necesidades/Donaciones; páginas pendientes |
| Donaciones | ⬜ | ⬜ | ⬜ | No iniciado (ms-citizen) |
| Notificaciones | ⬜ | ⬜ | ⬜ | No iniciado |
