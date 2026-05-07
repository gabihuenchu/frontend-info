# 📋 MS Identidad y Acceso - Documentación de Endpoints

**Base URL:** `http://localhost:8081`

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
