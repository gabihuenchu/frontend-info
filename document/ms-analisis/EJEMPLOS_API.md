# 🔗 MS-EMERGENCIAS - EJEMPLOS DE API

**Versión:** 1.0 | **Base URL:** `http://localhost:8082`

---

## 📚 Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Emergencias - Ejemplos](#emergencias---ejemplos)
3. [Anuncios - Ejemplos](#anuncios---ejemplos)
4. [Consultas Públicas](#consultas-públicas)
5. [Manejo de Errores](#manejo-de-errores)
6. [Postman Collection](#postman-collection)

---

## AUTENTICACIÓN

### Modo Producción (Firebase)

```bash
# 1. Obtener token de Firebase desde frontend
firebase auth currentUser

# 2. Usar en headers
Authorization: Bearer <firebase_idToken>
```

### Modo Desarrollo (Dev Headers)

```bash
# Usar headers para prueba
-H "X-Dev-User-Id: 550e8400-e29b-41d4-a716-446655440000"
-H "X-Dev-Roles: ADMINISTRADOR"
```

---

## EMERGENCIAS - EJEMPLOS

### 1️⃣ Declarar Nueva Emergencia (POST /emergencies)

#### CURL

```bash
curl -X POST http://localhost:8082/emergencies \
  -H "Authorization: Bearer <token_firebase>" \
  -H "Content-Type: application/json" \
  -H "X-Dev-User-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -H "X-Dev-Roles: ADMINISTRADOR" \
  -d '{
    "tipo": "TERREMOTO",
    "severidad": "ALTA",
    "region": "Región Metropolitana",
    "epicentro": {
      "longitud": -70.669,
      "latitud": -33.437
    },
    "zonaImpacto": [
      { "longitud": -70.680, "latitud": -33.430 },
      { "longitud": -70.680, "latitud": -33.445 },
      { "longitud": -70.660, "latitud": -33.445 },
      { "longitud": -70.660, "latitud": -33.430 }
    ]
  }'
```

#### Response (201 Created)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tipo": "TERREMOTO",
  "severidad": "ALTA",
  "region": "Región Metropolitana",
  "estado": "ACTIVA",
  "coordenadasEpicentro": {
    "type": "Point",
    "coordinates": [-70.669, -33.437]
  },
  "zonaImpacto": {
    "type": "Polygon",
    "coordinates": [[
      [-70.680, -33.430],
      [-70.680, -33.445],
      [-70.660, -33.445],
      [-70.660, -33.430]
    ]]
  },
  "declaradaPorUsuarioId": "550e8400-e29b-41d4-a716-446655440000",
  "declaradaEn": "2026-05-09T14:30:00Z",
  "actualizadaEn": "2026-05-09T14:30:00Z"
}
```

#### Headers Respuesta

```
HTTP/1.1 201 Created
Location: /emergencies/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

---

### 2️⃣ Cambiar Estado de Emergencia (PATCH /emergencies/{id}/status)

#### CURL

```bash
curl -X PATCH http://localhost:8082/emergencies/550e8400-e29b-41d4-a716-446655440000/status \
  -H "Authorization: Bearer <token_firebase>" \
  -H "Content-Type: application/json" \
  -H "X-Dev-User-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -H "X-Dev-Roles: ADMINISTRADOR" \
  -d '{
    "nuevoEstado": "CONTROLADA"
  }'
```

#### Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tipo": "TERREMOTO",
  "severidad": "ALTA",
  "region": "Región Metropolitana",
  "estado": "CONTROLADA",
  "coordenadasEpicentro": { "type": "Point", "coordinates": [-70.669, -33.437] },
  "zonaImpacto": { "type": "Polygon", "coordinates": [[...]] },
  "declaradaPorUsuarioId": "550e8400-e29b-41d4-a716-446655440000",
  "declaradaEn": "2026-05-09T14:30:00Z",
  "actualizadaEn": "2026-05-09T14:45:00Z"
}
```

---

### 3️⃣ Obtener Detalle de Emergencia (GET /emergencies/{id})

#### CURL

```bash
curl -X GET http://localhost:8082/emergencies/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <token_firebase>" \
  -H "X-Dev-User-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -H "X-Dev-Roles: ADMINISTRADOR"
```

#### Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tipo": "TERREMOTO",
  "severidad": "ALTA",
  "region": "Región Metropolitana",
  "estado": "CONTROLADA",
  "coordenadasEpicentro": { "type": "Point", "coordinates": [-70.669, -33.437] },
  "zonaImpacto": { "type": "Polygon", "coordinates": [[...]] },
  "declaradaPorUsuarioId": "550e8400-e29b-41d4-a716-446655440000",
  "declaradaEn": "2026-05-09T14:30:00Z",
  "actualizadaEn": "2026-05-09T14:45:00Z"
}
```

#### Errores Posibles

```json
{
  "type": "about:blank",
  "title": "Not Found",
  "status": 404,
  "detail": "Emergencia con id 550e8400-e29b-41d4-a716-446655440001 no encontrada",
  "instance": "/emergencies/550e8400-e29b-41d4-a716-446655440001"
}
```

---

## ANUNCIOS - EJEMPLOS

### 1️⃣ Publicar Anuncio (POST /announcements)

#### CURL

```bash
curl -X POST http://localhost:8082/announcements \
  -H "Authorization: Bearer <token_firebase>" \
  -H "Content-Type: application/json" \
  -H "X-Dev-User-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -H "X-Dev-Roles: ADMINISTRADOR" \
  -d '{
    "emergenciaId": "550e8400-e29b-41d4-a716-446655440000",
    "titulo": "Evacuación obligatoria zona norte",
    "contenido": "<h2>Instrucciones de Evacuación</h2><p>Se ordena la evacuación inmediata de todas las zonas norte del municipio. Diríganse a los puntos de reunión señalizados.</p>",
    "severidad": "EMERGENCIA",
    "alcance": "REGIONAL",
    "region": "Región Metropolitana",
    "vigenteDesde": "2026-05-09T14:30:00Z",
    "vigenteHasta": "2026-05-10T14:30:00Z"
  }'
```

#### Response (201 Created)

```json
{
  "id": "anuncio-uuid-123456789",
  "emergenciaId": "550e8400-e29b-41d4-a716-446655440000",
  "autorUsuarioId": "550e8400-e29b-41d4-a716-446655440000",
  "titulo": "Evacuación obligatoria zona norte",
  "contenido": "<h2>Instrucciones de Evacuación</h2><p>Se ordena la evacuación inmediata...</p>",
  "severidad": "EMERGENCIA",
  "alcance": "REGIONAL",
  "region": "Región Metropolitana",
  "vigenteDesde": "2026-05-09T14:30:00Z",
  "vigenteHasta": "2026-05-10T14:30:00Z",
  "creadoEn": "2026-05-09T14:35:00Z"
}
```

#### Headers Respuesta

```
HTTP/1.1 201 Created
Location: /announcements/anuncio-uuid-123456789
Content-Type: application/json
```

#### Errores Posibles

```json
// Emergencia no encontrada
{
  "type": "about:blank",
  "title": "Not Found",
  "status": 404,
  "detail": "Emergencia con id ... no encontrada",
  "instance": "/announcements"
}

// Emergencia finalizada
{
  "type": "about:blank",
  "title": "Conflict",
  "status": 409,
  "detail": "No se pueden publicar anuncios para emergencia en estado FINALIZADA",
  "instance": "/announcements"
}
```

---

## CONSULTAS PÚBLICAS

### 1️⃣ Listar Emergencias Activas (GET /emergencies/active)

#### CURL

```bash
curl -X GET http://localhost:8082/emergencies/active \
  -H "Content-Type: application/json"
```

#### Response (200 OK)

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tipo": "TERREMOTO",
    "severidad": "ALTA",
    "region": "Región Metropolitana",
    "estado": "ACTIVA",
    "coordenadasEpicentro": { "type": "Point", "coordinates": [-70.669, -33.437] },
    "zonaImpacto": { "type": "Polygon", "coordinates": [[...]] },
    "declaradaPorUsuarioId": "550e8400-e29b-41d4-a716-446655440000",
    "declaradaEn": "2026-05-09T14:30:00Z",
    "actualizadaEn": "2026-05-09T14:30:00Z"
  }
]
```

---

### 2️⃣ Obtener GeoJSON de Emergencias Activas (GET /emergencies/active/geojson)

#### CURL

```bash
curl -X GET http://localhost:8082/emergencies/active/geojson \
  -H "Content-Type: application/json"
```

#### Response (200 OK) - FeatureCollection

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-70.680, -33.430],
          [-70.680, -33.445],
          [-70.660, -33.445],
          [-70.660, -33.430]
        ]]
      },
      "properties": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "tipo": "TERREMOTO",
        "severidad": "ALTA",
        "region": "Región Metropolitana",
        "estado": "ACTIVA",
        "declaradaEn": "2026-05-09T14:30:00Z"
      }
    }
  ]
}
```

**Uso en Mapas:**
```javascript
// Leaflet.js
L.geoJSON(data).addTo(map);

// Mapbox GL JS
map.addSource('emergencies', {
  type: 'geojson',
  data: data
});
```

---

### 3️⃣ Listar Anuncios Vigentes (GET /announcements)

#### CURL - Sin parámetros (default)

```bash
curl -X GET http://localhost:8082/announcements \
  -H "Content-Type: application/json"
```

#### CURL - Con paginación

```bash
curl -X GET "http://localhost:8082/announcements?page=0&size=20&sort=severidad,desc" \
  -H "Content-Type: application/json"
```

#### Response (200 OK)

```json
{
  "content": [
    {
      "id": "anuncio-uuid-123456789",
      "emergenciaId": "550e8400-e29b-41d4-a716-446655440000",
      "autorUsuarioId": "550e8400-e29b-41d4-a716-446655440000",
      "titulo": "Evacuación obligatoria zona norte",
      "contenido": "<h2>Instrucciones de Evacuación</h2>...",
      "severidad": "EMERGENCIA",
      "alcance": "REGIONAL",
      "region": "Región Metropolitana",
      "vigenteDesde": "2026-05-09T14:30:00Z",
      "vigenteHasta": "2026-05-10T14:30:00Z",
      "creadoEn": "2026-05-09T14:35:00Z"
    }
  ],
  "pageable": {
    "sort": {
      "unsorted": false,
      "sorted": true,
      "empty": false
    },
    "offset": 0,
    "pageNumber": 0,
    "pageSize": 20,
    "paged": true,
    "unpaged": false
  },
  "last": true,
  "totalElements": 1,
  "totalPages": 1,
  "size": 20,
  "number": 0,
  "sort": {
    "unsorted": false,
    "sorted": true,
    "empty": false
  },
  "numberOfElements": 1,
  "first": true,
  "empty": false
}
```

---

## MANEJO DE ERRORES

### 400 - Bad Request (Validación Fallida)

```bash
curl -X POST http://localhost:8082/emergencies \
  -H "X-Dev-Roles: ADMINISTRADOR" \
  -d '{
    "tipo": "TERREMOTO",
    "severidad": "ALTA",
    "region": "",  # ERROR: notBlank
    "epicentro": null,  # ERROR: notNull
    "zonaImpacto": [{"longitud": -70.660, "latitud": -33.430}]  # ERROR: min 4
  }'
```

**Response:**
```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Invalid input",
  "instance": "/emergencies",
  "errors": {
    "region": "must not be blank",
    "epicentro": "must not be null",
    "zonaImpacto": "La zona de impacto debe tener al menos 4 coordenadas y formar un anillo cerrado"
  }
}
```

---

### 401 - Unauthorized (Sin Token)

```bash
curl -X POST http://localhost:8082/emergencies \
  -H "Content-Type: application/json" \
  -d '{ "tipo": "TERREMOTO", ... }'
```

**Response:**
```json
{
  "type": "about:blank",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Full authentication is required to access this resource"
}
```

---

### 403 - Forbidden (Permiso Insuficiente)

```bash
curl -X POST http://localhost:8082/emergencies \
  -H "X-Dev-User-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -H "X-Dev-Roles: PARTICULAR" \
  -d '{ "tipo": "TERREMOTO", ... }'
```

**Response:**
```json
{
  "type": "about:blank",
  "title": "Forbidden",
  "status": 403,
  "detail": "Access Denied. Required permission: EMERGENCIA_DECLARAR"
}
```

---

### 404 - Not Found

```bash
curl -X GET http://localhost:8082/emergencies/550e8400-e29b-41d4-a716-446655440001
```

**Response:**
```json
{
  "type": "about:blank",
  "title": "Not Found",
  "status": 404,
  "detail": "Emergencia con id 550e8400-e29b-41d4-a716-446655440001 no encontrada"
}
```

---

### 409 - Conflict (Transición Inválida)

```bash
curl -X PATCH http://localhost:8082/emergencies/550e8400-e29b-41d4-a716-446655440000/status \
  -H "X-Dev-User-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -H "X-Dev-Roles: ADMINISTRADOR" \
  -d '{ "nuevoEstado": "ACTIVA" }'  # Already ACTIVA
```

**Response:**
```json
{
  "type": "about:blank",
  "title": "Conflict",
  "status": 409,
  "detail": "Transición no permitida: ACTIVA -> ACTIVA"
}
```

---

## POSTMAN COLLECTION

### Import JSON

```json
{
  "info": {
    "name": "MS-Emergencias",
    "description": "Coordinación de Emergencias - CatastrofeCL",
    "version": "1.0"
  },
  "item": [
    {
      "name": "Emergencias",
      "item": [
        {
          "name": "POST /emergencies - Declarar",
          "request": {
            "method": "POST",
            "header": [
              { "key": "Authorization", "value": "Bearer {{token}}", "type": "text" },
              { "key": "X-Dev-User-Id", "value": "{{user_id}}", "type": "text" },
              { "key": "X-Dev-Roles", "value": "ADMINISTRADOR", "type": "text" },
              { "key": "Content-Type", "value": "application/json", "type": "text" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"tipo\": \"TERREMOTO\",\n  \"severidad\": \"ALTA\",\n  \"region\": \"Región Metropolitana\",\n  \"epicentro\": {\n    \"longitud\": -70.669,\n    \"latitud\": -33.437\n  },\n  \"zonaImpacto\": [\n    { \"longitud\": -70.680, \"latitud\": -33.430 },\n    { \"longitud\": -70.680, \"latitud\": -33.445 },\n    { \"longitud\": -70.660, \"latitud\": -33.445 },\n    { \"longitud\": -70.660, \"latitud\": -33.430 }\n  ]\n}"
            },
            "url": {
              "raw": "{{base_url}}/emergencies",
              "host": ["{{base_url}}"],
              "path": ["emergencies"]
            }
          },
          "response": []
        },
        {
          "name": "PATCH /emergencies/{id}/status - Cambiar Estado",
          "request": {
            "method": "PATCH",
            "header": [
              { "key": "Authorization", "value": "Bearer {{token}}", "type": "text" },
              { "key": "X-Dev-User-Id", "value": "{{user_id}}", "type": "text" },
              { "key": "X-Dev-Roles", "value": "ADMINISTRADOR", "type": "text" },
              { "key": "Content-Type", "value": "application/json", "type": "text" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"nuevoEstado\": \"CONTROLADA\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/emergencies/{{emergency_id}}/status",
              "host": ["{{base_url}}"],
              "path": ["emergencies", "{{emergency_id}}", "status"]
            }
          },
          "response": []
        },
        {
          "name": "GET /emergencies/active - Listar Activas",
          "request": {
            "method": "GET",
            "header": [{ "key": "Content-Type", "value": "application/json", "type": "text" }],
            "url": {
              "raw": "{{base_url}}/emergencies/active",
              "host": ["{{base_url}}"],
              "path": ["emergencies", "active"]
            }
          },
          "response": []
        },
        {
          "name": "GET /emergencies/active/geojson - GeoJSON",
          "request": {
            "method": "GET",
            "header": [{ "key": "Content-Type", "value": "application/json", "type": "text" }],
            "url": {
              "raw": "{{base_url}}/emergencies/active/geojson",
              "host": ["{{base_url}}"],
              "path": ["emergencies", "active", "geojson"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Anuncios",
      "item": [
        {
          "name": "POST /announcements - Publicar",
          "request": {
            "method": "POST",
            "header": [
              { "key": "Authorization", "value": "Bearer {{token}}", "type": "text" },
              { "key": "X-Dev-User-Id", "value": "{{user_id}}", "type": "text" },
              { "key": "X-Dev-Roles", "value": "ADMINISTRADOR", "type": "text" },
              { "key": "Content-Type", "value": "application/json", "type": "text" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"emergenciaId\": \"{{emergency_id}}\",\n  \"titulo\": \"Evacuación obligatoria zona norte\",\n  \"contenido\": \"<h2>Instrucciones</h2><p>Se ordena evacuación inmediata...</p>\",\n  \"severidad\": \"EMERGENCIA\",\n  \"alcance\": \"REGIONAL\",\n  \"region\": \"Región Metropolitana\",\n  \"vigenteDesde\": \"2026-05-09T14:30:00Z\",\n  \"vigenteHasta\": \"2026-05-10T14:30:00Z\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/announcements",
              "host": ["{{base_url}}"],
              "path": ["announcements"]
            }
          },
          "response": []
        },
        {
          "name": "GET /announcements - Listar Vigentes",
          "request": {
            "method": "GET",
            "header": [{ "key": "Content-Type", "value": "application/json", "type": "text" }],
            "url": {
              "raw": "{{base_url}}/announcements?page=0&size=20&sort=severidad,desc",
              "host": ["{{base_url}}"],
              "path": ["announcements"],
              "query": [
                { "key": "page", "value": "0" },
                { "key": "size", "value": "20" },
                { "key": "sort", "value": "severidad,desc" }
              ]
            }
          },
          "response": []
        }
      ]
    }
  ],
  "variable": [
    { "key": "base_url", "value": "http://localhost:8082", "type": "string" },
    { "key": "token", "value": "your_firebase_token", "type": "string" },
    { "key": "user_id", "value": "550e8400-e29b-41d4-a716-446655440000", "type": "string" },
    { "key": "emergency_id", "value": "550e8400-e29b-41d4-a716-446655440000", "type": "string" }
  ]
}
```

---

### Usar en Postman

1. **Importar:** File > Import > Paste JSON arriba
2. **Configurar Variables:** Edit Collection > Variables
3. **Ejecutar:** Click en cada request

---

## NOTAS IMPORTANTES

- **Coordenadas:** GeoJSON usa `[longitud, latitud]` (NOT `[lat, lng]`)
- **Zona Cerrada:** Primera y última coordenada deben ser idénticas
- **Vigencia Anuncio:** `NULL` en `vigenteHasta` = indefinida
- **Estado Terminal:** No se pueden hacer transiciones desde `FINALIZADA`
- **Public APIs:** No requieren autenticación (emergencias activas, anuncios vigentes)

