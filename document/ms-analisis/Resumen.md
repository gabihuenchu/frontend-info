
---

# 📊 **MS-EMERGENCIAS: GUÍA COMPLETA**

## **1️⃣ RESUMEN GENERAL DEL MICROSERVICIO**

**Nombre:** MS-Emergencias (Coordinación de Emergencias)
**Responsabilidad Principal:** Gestionar el ciclo de vida completo de emergencias declaradas en el sistema y los anuncios críticos asociados.

**Función Core:**

* Declarar nuevas emergencias (Terremoto, Tsunami, Incendio, Inundación, etc.)
* Cambiar estados de emergencias: [ACTIVA](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) → [CONTROLADA](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) → [FINALIZADA](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html)
* Publicar anuncios críticos vinculados a emergencias
* Exponer datos geoespaciales (zonas de impacto en mapa)

**Stack:**

* Spring Boot 3.4.0 + Java 21
* PostgreSQL + PostGIS (datos geoespaciales)
* RabbitMQ (eventos asincronos)
* Redis (caché)
* Firebase (autenticación en prod)

---

## **2️⃣ TABLA DE ENDPOINTS**

| # | Método                                                                                                                                                                  | Ruta                                                                                                                                                                                             | Permiso                                                                                                                                                                                     | Tipo      | Descripción               |
| - | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------- |
| 1 | `POST`                                                                                                                                                                 | [/emergencies](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html)                | ✅[EMERGENCIA_DECLARAR](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html)  | Protegido | Declarar nueva emergencia  |
| 2 | `PATCH`                                                                                                                                                                | [/emergencies/{id}/status](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html)    | ✅[EMERGENCIA_GESTIONAR](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) | Protegido | Cambiar estado             |
| 3 | [GET](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) | [/emergencies/{id}](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html)           | ✅[EMERGENCIA_GESTIONAR](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) | Protegido | Obtener detalle emergencia |
| 4 | [GET](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) | [/emergencies/active](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html)         | ❌ PÚBLICO                                                                                                                                                                                 | Público  | Listar emergencias activas |
| 5 | [GET](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) | [/emergencies/active/geojson](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) | ❌ PÚBLICO                                                                                                                                                                                 | Público  | GeoJSON para mapa          |
| 6 | `POST`                                                                                                                                                                 | `/announcements`                                                                                                                                                                               | ✅[ANUNCIO_PUBLICAR](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html)     | Protegido | Publicar anuncio           |
| 7 | [GET](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) | `/announcements`                                                                                                                                                                               | ❌ PÚBLICO                                                                                                                                                                                 | Público  | Listar anuncios (paginado) |

---

## **3️⃣ DETALLE DE ENDPOINTS**

### **Endpoint 1: Declarar Emergencia**

* POST /emergencies
  Permiso: EMERGENCIA_DECLARAR
  Respuesta: 201 Created

**Request:**

* {
  "tipo": "TERREMOTO",
  "severidad": "CRITICA",
  "region": "Valparaíso",
  "epicentro": {
  "latitud": -33.0469,
  "longitud": -71.6127
  },
  "zonaImpacto": [
  { "latitud": -33.04, "longitud": -71.61 },
  { "latitud": -33.04, "longitud": -71.62 },
  { "latitud": -33.05, "longitud": -71.62 },
  { "latitud": -33.05, "longitud": -71.61 },
  { "latitud": -33.04, "longitud": -71.61 }
  ]
  }

**Response (201):**

* {
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tipo": "TERREMOTO",
  "severidad": "CRITICA",
  "estado": "ACTIVA",
  "region": "Valparaíso",
  "coordenadasEpicentro": {
  "latitud": -33.0469,
  "longitud": -71.6127
  },
  "zonaImpacto": {
  "type": "Polygon",
  "coordinates": [[[...], [...], ...]]
  },
  "declaradaPorUsuarioId": "user-uuid-123",
  "declaradaEn": "2026-05-09T12:30:00Z",
  "actualizadaEn": "2026-05-09T12:30:00Z"
  }

**Errores Posibles:**

* `400 Bad Request` → Geometría inválida (p.ej., menos de 4 puntos)
* `401 Unauthorized` → Sin autenticación
* `403 Forbidden` → Permiso insuficiente

---

### **Endpoint 2: Cambiar Estado**

* PATCH /emergencies/{id}/status
  Permiso: EMERGENCIA_GESTIONAR
  Respuesta: 200 OK

**Request:**

* {
  "nuevoEstado": "CONTROLADA"
  }

**Transiciones Válidas:**

* [ACTIVA](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) → [CONTROLADA](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) ✅
* [CONTROLADA](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) → [FINALIZADA](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) ✅
* [CONTROLADA](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) → [ACTIVA](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) ❌ (inválido)
* [FINALIZADA](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) → cualquier estado ❌ (terminal)

**Errores Posibles:**

* `404 Not Found` → Emergencia no existe
* `409 Conflict` → Transición inválida

---

### **Endpoint 3: Listar Emergencias Activas (PÚBLICO)**

* GET /emergencies/active
  Respuesta: 200 OK (sin autenticación)

**Response:**

* [
  {
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tipo": "TERREMOTO",
  "severidad": "CRITICA",
  "estado": "ACTIVA",
  "region": "Valparaíso",
  "coordenadasEpicentro": {...},
  "declaradaEn": "2026-05-09T12:30:00Z"
  }
  ]

---

### **Endpoint 4: GeoJSON para Mapa (PÚBLICO)**

* GET /emergencies/active/geojson
  Respuesta: 200 OK (GeoJSON para Leaflet/Mapbox)

**Response:**

* {
  "type": "FeatureCollection",
  "features": [
  {
  "type": "Feature",
  "geometry": {
  "type": "Polygon",
  "coordinates": [[[...latitud, longitud...]]]
  },
  "properties": {
  "emergenciaId": "550e8400-e29b-41d4-a716-446655440000",
  "tipo": "TERREMOTO",
  "severidad": "CRITICA",
  "region": "Valparaíso",
  "declaradaEn": "2026-05-09T12:30:00Z"
  }
  }
  ]
  }

---

### **Endpoint 5: Publicar Anuncio**

* POST /announcements
  Permiso: ANUNCIO_PUBLICAR
  Respuesta: 201 Created

**Request:**

* {
  "emergenciaId": "550e8400-e29b-41d4-a716-446655440000",
  "titulo": "Corte de agua en zona norte",
  "contenido": "Se ha cortado el suministro de agua...",
  "severidad": "ALTO",
  "alcance": "REGIONAL",
  "region": "Valparaíso",
  "vigenteDesde": "2026-05-09T12:30:00Z",
  "vigenteHasta": "2026-05-10T12:30:00Z"
  }

**Response (201):**

* {
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "emergenciaId": "550e8400-e29b-41d4-a716-446655440000",
  "titulo": "Corte de agua en zona norte",
  "contenido": "Se ha cortado el suministro de agua...",
  "severidad": "ALTO",
  "alcance": "REGIONAL",
  "region": "Valparaíso",
  "vigenteDesde": "2026-05-09T12:30:00Z",
  "vigenteHasta": "2026-05-10T12:30:00Z",
  "creadoEn": "2026-05-09T12:35:00Z"
  }

**Errores:**

* `404 Not Found` → Emergencia no existe
* `409 Conflict` → Emergencia en estado FINALIZADA

---

### **Endpoint 6: Listar Anuncios (PÚBLICO)**

* GET /announcements?page=0&size=20
  Respuesta: 200 OK (paginado)

**Response:**

* {
  "content": [
  {
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "titulo": "Corte de agua en zona norte",
  "severidad": "ALTO",
  "alcance": "REGIONAL",
  "vigenteDesde": "2026-05-09T12:30:00Z",
  "vigenteHasta": "2026-05-10T12:30:00Z"
  }
  ],
  "totalElements": 45,
  "totalPages": 3,
  "currentPage": 0,
  "pageSize": 20
  }

---

## **4️⃣ FLUJO PRINCIPAL DE FUNCIONAMIENTO**

┌─────────────────────────────────────────────────────────┐
│                    FLUJO DE EMERGENCIA                   │
└─────────────────────────────────────────────────────────┘

1. DECLARACIÓN
   ├─ Autoridad → POST /emergencies
   ├─ ValidaGeometría (PostGIS: anillo cerrado, 4+ puntos)
   ├─ Crea entidad Emergencia
   ├─ Guarda en DB (PostgreSQL)
   └─ Publica evento "emergency.created" en RabbitMQ
2. CAMBIO DE ESTADO
   ├─ Autoridad → PATCH /emergencies/{id}/status
   ├─ Valida transición (ACTIVA→CONTROLADA→FINALIZADA)
   ├─ Actualiza DB
   └─ Publica evento "emergency.status.changed"
3. ANUNCIOS ASOCIADOS
   ├─ Autoridad → POST /announcements
   ├─ Valida emergencia sea ACTIVA
   ├─ Guarda Anuncio vinculado
   └─ Publica evento "announcement.published"
4. CONSULTA PÚBLICA (SIN AUTENTICACIÓN)
   ├─ GET /emergencies/active (ciudadanos)
   ├─ GET /emergencies/active/geojson (para mapa)
   ├─ GET /announcements (listar alertas)
   └─ Consultan datos desde Redis (caché)

---

## **5️⃣ EXPLICACIÓN DE COLAS / MENSAJERÍA RABBITMQ**

### **Configuración**

* **Exchange:** [catastrofescl.events](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) (Topic)
* **Patrón:** Topic-based routing con routing keys

### **Eventos Publicados por MS-Emergencias**

| # | Evento                                                                                                                                                                                              | Routing Key                                                                                                                                                                            | Estructura                                  | Consumidores                   |
| - | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------ |
| 1 | [EmergenciaCreadaEvento](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html)         | [emergency.created](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) | UUID emergenciaId, tipo, severidad, región | MS-Resources, MS-Notifications |
| 2 | [EstadoEmergenciaCambiadoEvento](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) | `emergency.status.changed`                                                                                                                                                           | emergenciaId, estado anterior, estado nuevo | MS-Notifications, MS-Citizen   |
| 3 | [AnuncioPublicadoEvento](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html)         | `announcement.published`                                                                                                                                                             | anuncioId, emergenciaId, severidad, alcance | MS-Notifications, MS-Citizen   |

### **Ejemplo: Evento PublicadoEmergencia**

* {
  "eventoId": "550e8400-e29b-41d4-a716-446655440002",
  "ocurridoEn": "2026-05-09T12:30:00Z",
  "correlacionId": "550e8400-e29b-41d4-a716-446655440000",
  "versionEvento": "1.0",
  "fuente": "ms-emergencies",
  "emergenciaId": "550e8400-e29b-41d4-a716-446655440000",
  "tipo": "TERREMOTO",
  "severidad": "CRITICA",
  "estado": "ACTIVA",
  "region": "Valparaíso",
  "resumen": "Terremoto de severidad CRITICA declarado en Valparaíso",
  "declaradaPorUsuarioId": "user-uuid-123"
  }

**Header AMQP:**

* Message-Id: 550e8400-e29b-41d4-a716-446655440002
  Correlation-Id: 550e8400-e29b-41d4-a716-446655440000
  Content-Type: application/json

---

## **6️⃣ MÉTODOS QUE PUBLICAN MENSAJES**

| Método                                                                                                                                                                              | Clase                                                                                                                                                                                    | Evento Publicado                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [declarar()](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html)      | [ServicioEmergencias](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) | [EmergenciaCreadaEvento](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html)         |
| [cambiarEstado()](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) | [ServicioEmergencias](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) | [EstadoEmergenciaCambiadoEvento](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) |
| [publicar()](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html)      | [ServicioAnuncios](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html)    | [AnuncioPublicadoEvento](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html)         |

---

## **7️⃣ MÉTODOS QUE CONSUMEN MENSAJES**

 **MS-Emergencias NO consume eventos** , solo publica.
**Otros MS consumen desde MS-Emergencias:**

* MS-Resources: Escucha [emergency.created](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) para vincular centros
* MS-Notifications: Escucha todos los eventos para enviar alertas
* MS-Citizen: Escucha `announcement.published` para mostrar anuncios

---

## **8️⃣ ENTIDADES / MODELOS**

### **Emergencia**

* @Entity
  public class Emergencia {
  UUID id;
  TipoEmergencia tipo;           // TERREMOTO, TSUNAMI, INCENDIO, etc.
  SeveridadEmergencia severidad; // LEVE, MODERADA, GRAVE, CRITICA
  String region;                 // "Valparaíso", "Metropolitana", etc.
  EstadoEmergencia estado;       // ACTIVA, CONTROLADA, FINALIZADA
  Point coordenadasEpicentro;    // PostGIS POINT (lat, long)
  Polygon zonaImpacto;           // PostGIS POLYGON (zona afectada)
  UUID declaradaPorUsuarioId;    // Quién la declaró
  OffsetDateTime declaradaEn;    // Timestamp creación
  OffsetDateTime actualizadaEn;  // Timestamp última actualización
  }

### **Anuncio**

* @Entity
  public class Anuncio {
  UUID id;
  UUID emergenciaId;              // Vinculado a emergencia
  UUID autorUsuarioId;            // Quién lo publicó
  String titulo;                  // "Corte de agua"
  String contenido;               // Descripción detallada
  SeveridadAnuncio severidad;     // BAJO, MEDIO, ALTO, CRITICO
  AlcanceAnuncio alcance;         // LOCAL, PROVINCIAL, REGIONAL, NACIONAL
  String region;                  // Zona geográfica
  OffsetDateTime vigenteDesde;    // Cuándo comienza
  OffsetDateTime vigenteHasta;    // Cuándo termina (null = sin límite)
  OffsetDateTime creadoEn;        // Timestamp
  }

### **Enumeraciones**

TipoEmergencia {
    TERREMOTO, TSUNAMI, INCENDIO, INUNDACION,
    ERUPCION_VOLCANICA, ALUVION, OTRO
}

SeveridadEmergencia {
    LEVE, MODERADA, GRAVE, CRITICA
}

EstadoEmergencia {
    ACTIVA, CONTROLADA, FINALIZADA
}

SeveridadAnuncio {
    BAJO, MEDIO, ALTO, CRITICO
}

AlcanceAnuncio {
    LOCAL, PROVINCIAL, REGIONAL, NACIONAL
}

---

## **9️⃣ SERVICIOS INTERNOS**

| Servicio                      | Responsabilidad                                   |
| ----------------------------- | ------------------------------------------------- |
| **ServicioEmergencias** | CRUD emergencias, cambio de estados, validaciones |
| **ServicioAnuncios**    | CRUD anuncios, filtrado por vigencia              |
| **PublicadorEventos**   | Publica eventos en RabbitMQ con idempotencia      |
| **GeometriaMapper**     | Convierte DTOs → Geometrías PostGIS             |
| **MapeadorEmergencias** | Convierte Emergencia → EmergenciaResponse        |

---

## **🔟 REPOSITORIOS / ACCESO A DB**

RepositorioEmergencias {
    findById(UUID id);
    save(Emergencia);
    findByEstadoOrderByDeclaradaEnDesc(estado);
    // Projections para GeoJSON
    List`<ProyeccionPoligonoEmergenciaActiva>`
        findActivePolygons();
}

RepositorioAnuncios {
    findById(UUID id);
    save(Anuncio);
    findByVigenteDesdeBeforeAndVigenteHastaAfter(...)
        // Anuncios vigentes (con paginación)
}

---

## **1️⃣1️⃣ AUTENTICACIÓN Y SEGURIDAD**

| Componente               | Implementación                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Autenticación** | Firebase (prod) / Dev Headers (desarrollo)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Token JWT**      | Via[FiltroAutenticacionFirebase](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html)                                                                                                                                                                                                                                                                                                                                                                                 |
| **RBAC**           | Permisos:[EMERGENCIA_DECLARAR](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html), [EMERGENCIA_GESTIONAR](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html), [ANUNCIO_PUBLICAR](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) |
| **Validación**    | Bean Validation (@NotNull, @Valid, @Size)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **CORS**           | Configurado hacia Vercel                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

---

## **1️⃣2️⃣ VALIDACIONES IMPORTANTES**

✅ **Geometrías PostGIS:**

* Zona de impacto debe ser **anillo cerrado** (primer punto = último punto)
* Mínimo **4 coordenadas**
* Latitud: -90 a 90, Longitud: -180 a 180

✅ **Estados:**

* Solo transiciones válidas permitidas
* FINALIZADA es estado terminal

✅ **Anuncios:**

* Solo se pueden publicar si emergencia está en ACTIVA
* [vigenteDesde](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html) ≤ [vigenteHasta](vscode-file://vscode-app/c:/Users/CAMILO/AppData/Local/Programs/Microsoft%20VS%20Code/8b640eef5a/resources/app/out/vs/code/electron-browser/workbench/workbench.html)

---

## **1️⃣3️⃣ EXCEPCIONES Y ERRORES**

* EmergenciaNoEncontradaException      → 404 Not Found
  TransicionEstadoInvalidaException    → 409 Conflict
  EmergenciaNoActivaException          → 409 Conflict (para anuncios)
  GeometriaInvalidaException           → 400 Bad Request
  AnuncioNoEncontradoException         → 404 Not Found

## **1️⃣4️⃣ RECOMENDACIONES PARA INTEGRACIÓN DESDE FRONTEND**

### **A. Para Mostrar Emergencias en Mapa**

// Next.js hook
const { data: emergenciasGeoJson } = useFetch('/emergencies/active/geojson');

// Con Leaflet/React-Leaflet
`<GeoJSON data={emergenciasGeoJson} />`

### **B. Para Listar Anuncios Críticos**

* const { data: anuncios, fetchNextPage } = useInfiniteQuery({
  queryKey: ['announcements'],
  queryFn: ({ pageParam = 0 }) =>
  fetch(`/announcements?page=${pageParam}&size=20`),
  getNextPageParam: (last) => last.nextPage
  });

### **C. Polling para Cambios (Si no tienes WebSocket)**

useEffect(() => {
  const interval = setInterval(async () => {
    const res = await fetch('/emergencies/active');
    setEmergencias(await res.json());
  }, 5000); // Cada 5 segundos

  return () => clearInterval(interval);
}, []);

### **D. Headers Requeridos**

* fetch('/emergencies', {
  headers: {
  'Authorization': `Bearer ${token_jwt}`,
  'Content-Type': 'application/json'
  }
  });

## **1️⃣5️⃣ POSIBLES ERRORES Y CÓMO MANEJARLOS**

| Error                | Causa                                         | Solución                                        |
| -------------------- | --------------------------------------------- | ------------------------------------------------ |
| `400 Bad Request`  | Geometría inválida o payload incorrecto     | Valida que zona sea anillo cerrado con 4+ puntos |
| `401 Unauthorized` | JWT expirado o inválido                      | Refresh el token                                 |
| `403 Forbidden`    | Permiso insuficiente                          | Verifica roles en MS-Identity                    |
| `404 Not Found`    | Emergencia/Anuncio no existe                  | Verifica ID en DB                                |
| `409 Conflict`     | Transición inválida o emergencia FINALIZADA | Valida estado antes de actualizar                |

---

## **🎯 FLUJO RECOMENDADO PARA FRONTEND**

1. [Ciudadano] GET /emergencies/active/geojson
   └─ Obtiene polígonos para mostrar en mapa
2. [Ciudadano] GET /announcements?page=0&size=10
   └─ Obtiene anuncios críticos para notificaciones
3. [Polling cada 5s] GET /emergencies/active
   └─ Verifica cambios de estado
4. [Si es Autoridad] POST /emergencies
   └─ Declara nueva emergencia
5. [Si es Autoridad] POST /announcements
   └─ Publica alertas
6. [Si es Autoridad] PATCH /emergencies/{id}/status
   └─ Actualiza estado a CONTROLADA o FINALIZADA

---

Esta es la guía completa para consumir el microservicio desde el frontend.
