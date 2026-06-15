# 📋 MS Identidad y Acceso - Documentación de Endpoints

**Base URL (MS Identidad):** `http://localhost:8081`  
**Base URL recomendada desde frontend:** `http://localhost:8080` (API Gateway)

> **Flujos login/registro (Firebase + BD):** ver [flujo-autenticacion.md](./flujo-autenticacion.md)

---

## 🔐 Auth Controller

### 1. Registrar Nueva Cuenta
- **Método:** `POST`
- **Ruta:** `/auth/register`
- **Autenticación:** ❌ No requerida
- **Permisos:** Público
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string",
    "nombres": "string",
    "apellidos": "string",
    "numeroDocumento": "string",
    "tipoDocumento": "string"
  }
  ```
- **Respuesta:** `201 Created`
  ```json
  {
    "id": "uuid",
    "nombres": "string",
    "apellidos": "string",
    "email": "string",
    "numeroDocumento": "string",
    "tipoDocumento": "string",
    "firebaseUid": "string",
    "estado": "ACTIVO",
    "roles": [],
    "permisos": []
  }
  ```

### 2. Sincronizar Usuario Firebase
- **Método:** `POST`
- **Ruta:** `/auth/firebase/sync`
- **Autenticación:** ✅ Requerida
- **Permisos:** Usuario autenticado
- **Body:**
  ```json
  {
    "nombres": "string",
    "apellidos": "string",
    "email": "string",
    "numeroDocumento": "string",
    "tipoDocumento": "string"
  }
  ```
- **Respuesta:** `201 Created`
  ```json
  {
    "id": "uuid",
    "nombres": "string",
    "apellidos": "string",
    "email": "string",
    "numeroDocumento": "string",
    "tipoDocumento": "string",
    "firebaseUid": "string",
    "estado": "ACTIVO",
    "roles": [],
    "permisos": []
  }
  ```

### 3. Sincronizar Usuario (Sistema)
- **Método:** `POST`
- **Ruta:** `/auth/firebase/sync/system`
- **Autenticación:** ❌ No requerida (usa secret)
- **Headers Requeridos:**
  ```
  X-Sync-Secret: <firebase.sync-secret>
  ```
- **Body:**
  ```json
  {
    "firebaseUid": "string",
    "nombres": "string",
    "apellidos": "string",
    "email": "string",
    "numeroDocumento": "string",
    "tipoDocumento": "string"
  }
  ```
- **Respuesta:** `201 Created`

### 4. Generar Invitación para Operador
- **Método:** `POST`
- **Ruta:** `/auth/invitacion/operador`
- **Autenticación:** ✅ Requerida
- **Permisos:** `USUARIO_GESTIONAR`
- **Body:**
  ```json
  {
    "correo": "string"
  }
  ```
- **Respuesta:** `201 Created`
  ```json
  {
    "id": "uuid",
    "correo": "string",
    "token": "string",
    "estado": "PENDIENTE",
    "fechaCreacion": "2024-01-01T00:00:00Z",
    "fechaExpiracion": "2024-01-08T00:00:00Z"
  }
  ```

### 5. Aceptar Invitación
- **Método:** `POST`
- **Ruta:** `/auth/invitacion/aceptar`
- **Autenticación:** ✅ Requerida
- **Permisos:** Usuario autenticado
- **Body:**
  ```json
  {
    "token": "string"
  }
  ```
- **Respuesta:** `200 OK`

---

## 👥 Usuario Controller

### 6. Obtener Perfil Usuario (por ID)
- **Método:** `GET`
- **Ruta:** `/usuarios/{id}`
- **Autenticación:** ✅ Requerida
- **Permisos:** `USUARIO_GESTIONAR` O es el mismo usuario
- **Parámetros:**
  - `id` (UUID): ID del usuario
- **Respuesta:** `200 OK`
  ```json
  {
    "id": "uuid",
    "nombres": "string",
    "apellidos": "string",
    "email": "string",
    "numeroDocumento": "string",
    "tipoDocumento": "string",
    "firebaseUid": "string",
    "estado": "ACTIVO",
    "roles": ["uuid"],
    "permisos": ["string"]
  }
  ```

### 7. Obtener Mi Perfil
- **Método:** `GET`
- **Ruta:** `/usuarios/yo`
- **Autenticación:** ✅ Requerida
- **Permisos:** Usuario autenticado
- **Respuesta:** `200 OK` (mismo formato que endpoint 6)

### 8. Obtener Perfil por Firebase UID
- **Método:** `GET`
- **Ruta:** `/usuarios/firebase/{firebaseUid}`
- **Autenticación:** ✅ Requerida
- **Permisos:** `USUARIO_GESTIONAR` O es el mismo usuario
- **Parámetros:**
  - `firebaseUid` (string): Firebase UID del usuario
- **Respuesta:** `200 OK` (mismo formato que endpoint 6)

### 9. Obtener Todos los Usuarios
- **Método:** `GET`
- **Ruta:** `/usuarios`
- **Autenticación:** ✅ Requerida
- **Permisos:** `USUARIO_GESTIONAR`
- **Respuesta:** `200 OK`
  ```json
  [
    {
      "id": "uuid",
      "nombres": "string",
      "apellidos": "string",
      "email": "string",
      "numeroDocumento": "string",
      "tipoDocumento": "string",
      "firebaseUid": "string",
      "estado": "ACTIVO",
      "roles": ["uuid"],
      "permisos": ["string"]
    }
  ]
  ```

### 10. Asignar Rol a Usuario
- **Método:** `POST`
- **Ruta:** `/usuarios/{id}/roles`
- **Autenticación:** ✅ Requerida
- **Permisos:** `ROL_ASIGNAR`
- **Parámetros:**
  - `id` (UUID): ID del usuario
- **Body:**
  ```json
  {
    "rolId": "uuid"
  }
  ```
- **Respuesta:** `200 OK`

### 11. Quitar Rol de Usuario
- **Método:** `DELETE`
- **Ruta:** `/usuarios/{id}/roles/{rolId}`
- **Autenticación:** ✅ Requerida
- **Permisos:** `ROL_ASIGNAR`
- **Parámetros:**
  - `id` (UUID): ID del usuario
  - `rolId` (UUID): ID del rol
- **Respuesta:** `204 No Content`

### 12. Cambiar Estado de Usuario
- **Método:** `PATCH`
- **Ruta:** `/usuarios/{id}/estado`
- **Autenticación:** ✅ Requerida
- **Permisos:** `USUARIO_GESTIONAR`
- **Parámetros:**
  - `id` (UUID): ID del usuario
- **Body:**
  ```json
  {
    "estado": "ACTIVO|INACTIVO|SUSPENDIDO"
  }
  ```
- **Respuesta:** `200 OK`

### 13. Solicitar Rol
- **Método:** `POST`
- **Ruta:** `/usuarios/solicitudes-rol`
- **Autenticación:** ✅ Requerida
- **Permisos:** Usuario autenticado
- **Body:**
  ```json
  {
    "rolId": "uuid",
    "justificacion": "string"
  }
  ```
- **Respuesta:** `201 Created`

### 14. Resolver Solicitud de Rol
- **Método:** `PATCH`
- **Ruta:** `/usuarios/solicitudes-rol/{id}`
- **Autenticación:** ✅ Requerida
- **Permisos:** `USUARIO_GESTIONAR`
- **Parámetros:**
  - `id` (UUID): ID de la solicitud
- **Body:**
  ```json
  {
    "estado": "APROBADA|RECHAZADA"
  }
  ```
- **Respuesta:** `200 OK`

---

## 🔑 Rol Controller

### 15. Asignar Permiso a Rol
- **Método:** `POST`
- **Ruta:** `/roles/{id}/permisos/{permisoId}`
- **Autenticación:** ✅ Requerida
- **Permisos:** `USUARIO_GESTIONAR`
- **Parámetros:**
  - `id` (UUID): ID del rol
  - `permisoId` (UUID): ID del permiso
- **Respuesta:** `201 Created`

### 16. Quitar Permiso de Rol
- **Método:** `DELETE`
- **Ruta:** `/roles/{id}/permisos/{permisoId}`
- **Autenticación:** ✅ Requerida
- **Permisos:** `USUARIO_GESTIONAR`
- **Parámetros:**
  - `id` (UUID): ID del rol
  - `permisoId` (UUID): ID del permiso
- **Respuesta:** `204 No Content`

---

## 📝 Permiso Controller

### 17. Obtener Todos los Permisos
- **Método:** `GET`
- **Ruta:** `/permisos`
- **Autenticación:** ✅ Requerida
- **Permisos:** `USUARIO_GESTIONAR`
- **Respuesta:** `200 OK`
  ```json
  [
    {
      "id": "uuid",
      "nombre": "string",
      "descripcion": "string",
      "codigo": "string"
    }
  ]
  ```

---

## 🔐 Permisos Disponibles

| Código | Descripción |
|--------|-------------|
| `USUARIO_GESTIONAR` | Gestionar usuarios |
| `ROL_ASIGNAR` | Asignar roles |

---

## 📌 Notas Importantes

- **Base URL:** Cambiar `localhost:8081` según el entorno (dev, staging, prod)
- **Autenticación:** Los endpoints autenticados requieren un token válido de Firebase en el header `Authorization: Bearer <token>`
- **CORS:** Verificar configuración de CORS si el frontend está en otro dominio
- **Errores:** Los códigos de error incluyen mensajes descriptivos
- **UUIDs:** Todos los IDs son de tipo UUID v4
- **Validación:** Los DTOs incluyen validaciones que pueden retornar errores de validación (400 Bad Request)

---

## 🌪️ Emergencias y Anuncios - Consumo desde Frontend

> Este bloque documenta el contrato de consumo para el portal ciudadano y el dashboard de autoridades. Desde el frontend se recomienda llamar siempre al API Gateway y no al microservicio directo.

### Base URL de consumo
- `http://localhost:8080`

### Endpoints públicos para el portal ciudadano

#### 1. Listar emergencias activas
- **Método:** `GET`
- **Ruta:** `/emergencies/active`
- **Autenticación:** No requerida
- **Respuesta:** lista de emergencias activas con datos geoespaciales básicos
- **Uso frontend:** listado, tarjetas, alertas y filtros rápidos

#### 2. Obtener GeoJSON de emergencias activas
- **Método:** `GET`
- **Ruta:** `/emergencies/active/geojson`
- **Autenticación:** No requerida
- **Respuesta:** `FeatureCollection` GeoJSON
- **Uso frontend:** render de polígonos en mapa Leaflet / React Leaflet

#### 3. Listar anuncios vigentes
- **Método:** `GET`
- **Ruta:** `/announcements?page=0&size=20`
- **Autenticación:** No requerida
- **Respuesta:** paginada, con `content`, `totalElements`, `totalPages`
- **Uso frontend:** feed de anuncios críticos, banners y panel informativo

### Endpoints protegidos para dashboard de autoridades

#### 4. Declarar emergencia
- **Método:** `POST`
- **Ruta:** `/emergencies`
- **Permiso requerido:** `EMERGENCIA_DECLARAR`
- **Body esperado:** `tipo`, `severidad`, `region`, `epicentro`, `zonaImpacto`
- **Respuesta:** `201 Created` con la emergencia creada

#### 5. Cambiar estado de emergencia
- **Método:** `PATCH`
- **Ruta:** `/emergencies/{id}/status`
- **Permiso requerido:** `EMERGENCIA_GESTIONAR`
- **Body esperado:** `nuevoEstado`
- **Respuesta:** `200 OK` con la emergencia actualizada

#### 6. Obtener detalle de emergencia
- **Método:** `GET`
- **Ruta:** `/emergencies/{id}`
- **Permiso requerido:** `EMERGENCIA_GESTIONAR`
- **Respuesta:** detalle completo de la emergencia

#### 7. Publicar anuncio
- **Método:** `POST`
- **Ruta:** `/announcements`
- **Permiso requerido:** `ANUNCIO_PUBLICAR`
- **Body esperado:** `emergenciaId`, `titulo`, `contenido`, `severidad`, `alcance`, `region`, `vigenteDesde`, `vigenteHasta`
- **Respuesta:** `201 Created` con el anuncio publicado

### Request y response de referencia

#### Declarar emergencia
```json
{
  "tipo": "TERREMOTO",
  "severidad": "CRITICA",
  "region": "Valparaíso",
  "epicentro": { "latitud": -33.045, "longitud": -71.619 },
  "zonaImpacto": [
    { "latitud": -33.04, "longitud": -71.61 },
    { "latitud": -33.04, "longitud": -71.62 },
    { "latitud": -33.05, "longitud": -71.62 },
    { "latitud": -33.05, "longitud": -71.61 },
    { "latitud": -33.04, "longitud": -71.61 }
  ]
}
```

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "estado": "ACTIVA",
  "tipo": "TERREMOTO",
  "severidad": "CRITICA",
  "region": "Valparaíso"
}
```

#### Publicar anuncio
```json
{
  "emergenciaId": "550e8400-e29b-41d4-a716-446655440000",
  "titulo": "Corte de agua en sector norte",
  "contenido": "Se recomienda ahorrar agua potable hasta nuevo aviso.",
  "severidad": "ALTO",
  "alcance": "REGIONAL",
  "region": "Valparaíso",
  "vigenteDesde": "2026-05-09T12:00:00Z",
  "vigenteHasta": "2026-05-10T12:00:00Z"
}
```

### Recomendaciones de consumo
- Centralizar las rutas en un único cliente `emergencies.service.ts` o `announcements.service.ts`.
- Manejar `400`, `403`, `404` y `409` como errores de negocio visibles en UI.
- Para mapas, consumir primero `GET /emergencies/active/geojson` y luego enriquecer con el listado `GET /emergencies/active`.
- Para notificaciones en tiempo real, combinar polling con React Query mientras el WebSocket de notificaciones no esté integrado.

---

## 🛠️ Ejemplo de Uso (Frontend - JavaScript/TypeScript)

```javascript
// Registrar nueva cuenta
async function registrarCuenta() {
  const response = await fetch('http://localhost:8081/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'usuario@example.com',
      password: 'miContraseña123',
      nombres: 'Juan',
      apellidos: 'Pérez',
      numeroDocumento: '12345678-9',
      tipoDocumento: 'CI'
    })
  });
  
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  
  return await response.json();
}

// Obtener perfil del usuario actual
async function obtenerMiPerfil() {
  const response = await fetch('http://localhost:8081/usuarios/yo', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  
  return await response.json();
}

// Solicitar rol
async function solicitarRol(rolId, justificacion) {
  const response = await fetch('http://localhost:8081/usuarios/solicitudes-rol', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      rolId,
      justificacion
    })
  });
  
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  
  return await response.json();
}
```

---

## 📞 Contacto & Soporte

Para preguntas o reportar problemas con los endpoints, contactar al equipo de backend.

**Última actualización:** 2026-05-05
