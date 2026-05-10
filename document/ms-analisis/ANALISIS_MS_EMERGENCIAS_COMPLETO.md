# 📋 ANÁLISIS COMPLETO - MS EMERGENCIAS (ms-emergencies)

**Generado:** 2026-05-09  
**Versión:** 1.0.0  
**Puerto Local:** 8082  
**Java Version:** 21  

---

## 📌 TABLA DE CONTENIDOS

1. [Arquitectura y Responsabilidad](#1-arquitectura-y-responsabilidad)
2. [Entidades/Modelos JPA](#2-entidadesmodelos-jpa)
3. [Endpoints REST](#3-endpoints-rest)
4. [Servicios y Lógica](#4-servicios-y-lógica)
5. [Repositorios](#5-repositorios)
6. [Mensajería RabbitMQ](#6-mensajería-rabbitmq)
7. [DTOs](#7-dtos)
8. [Excepciones y Errores](#8-excepciones-y-errores)
9. [Configuración](#9-configuración)
10. [Enums](#10-enums)

---

## 1. ARQUITECTURA Y RESPONSABILIDAD

### 1.1 Función Principal
**MS-Emergencias** es un microservicio de **coordinación de emergencias** dentro de la plataforma CatastrofeCL. Gestiona:
- **Declaración de emergencias** (terremoto, tsunami, incendio, inundación, erupción, aluvión)
- **Ciclo de vida** de emergencias (ACTIVA → CONTROLADA → FINALIZADA)
- **Anuncios críticos** asociados a emergencias
- **Datos geoespaciales** de zonas de impacto (usando PostGIS)

### 1.2 Responsabilidades Core
| Área | Descripción |
|------|-----------|
| **Emergencias** | CRUD, transiciones de estado, persistencia con geometrías PostGIS |
| **Anuncios Críticos** | Publicación de comunicados, filtraje por vigencia |
| **Mensajería** | Publicación de eventos en RabbitMQ para otros microservicios |
| **Seguridad** | Control de acceso basado en permisos (RBAC) con Firebase Auth |
| **Geolocalización** | Manejo de puntos (epicentro) y polígonos (zona de impacto) en SRID 4326 |

### 1.3 Stack Tecnológico
- **Framework:** Spring Boot 3.4.0
- **Persistencia:** Spring Data JPA + PostgreSQL + PostGIS + Flyway
- **Seguridad:** Spring Security + Firebase Admin SDK
- **Mensajería:** Spring AMQP (RabbitMQ)
- **Cache:** Redis (idempotencia)
- **API Docs:** OpenAPI 3 (Swagger UI)
- **Mapping:** Lombok, JTS Core (geometrías)

---

## 2. ENTIDADES/MODELOS JPA

### 2.1 Entidad: Emergencia

**Tabla:** `emergencias`

```java
@Entity
@Table(name = "emergencias")
public class Emergencia {
    
    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;                          // PK
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 50)
    private TipoEmergencia tipo;              // TERREMOTO, TSUNAMI, INCENDIO, INUNDACION, ERUPCION, ALUVION
    
    @Enumerated(EnumType.STRING)
    @Column(name = "severidad", nullable = false, length = 20)
    private SeveridadEmergencia severidad;    // BAJA, MEDIA, ALTA, CATASTROFICA
    
    @Column(name = "region", nullable = false, length = 100)
    private String region;                    // Ej: "Región Metropolitana"
    
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoEmergencia estado;           // ACTIVA, CONTROLADA, FINALIZADA (default: ACTIVA)
    
    @JdbcTypeCode(SqlTypes.GEOGRAPHY)
    @Column(name = "coordenadas_epicentro", columnDefinition = "geography(Point,4326)")
    private Point coordenadasEpicentro;       // Punto PostGIS SRID 4326
    
    @JdbcTypeCode(SqlTypes.GEOGRAPHY)
    @Column(name = "zona_impacto", columnDefinition = "geography(Polygon,4326)")
    private Polygon zonaImpacto;              // Polígono PostGIS SRID 4326 (opcional)
    
    @Column(name = "declarada_por_usuario_id", nullable = false)
    private UUID declaradaPorUsuarioId;       // FK a ms-identity
    
    @Column(name = "declarada_en", nullable = false)
    private OffsetDateTime declaradaEn;       // Auto-set en @PrePersist
    
    @Column(name = "actualizada_en", nullable = false)
    private OffsetDateTime actualizadaEn;     // Auto-update en @PreUpdate
    
    // Métodos @PrePersist y @PreUpdate generan UUID, establecen timestamps
}
```

**Índices Recomendados (BD):**
```sql
CREATE INDEX idx_emergencias_estado ON emergencias(estado);
CREATE INDEX idx_emergencias_tipo ON emergencias(tipo);
CREATE INDEX idx_emergencias_zona_impacto ON emergencias USING GIST(zona_impacto);
CREATE INDEX idx_emergencias_epicentro ON emergencias USING GIST(coordenadas_epicentro);
```

---

### 2.2 Entidad: Anuncio

**Tabla:** `anuncios`

```java
@Entity
@Table(name = "anuncios")
public class Anuncio {
    
    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;                          // PK
    
    @Column(name = "emergencia_id", nullable = false)
    private UUID emergenciaId;                // FK → emergencias(id)
    
    @Column(name = "autor_usuario_id", nullable = false)
    private UUID autorUsuarioId;              // FK a ms-identity
    
    @Column(name = "titulo", nullable = false, length = 200)
    private String titulo;                    // Ej: "Evacuación obligatoria zona norte"
    
    @Column(name = "contenido", nullable = false, columnDefinition = "text")
    private String contenido;                 // Contenido HTML o markdown
    
    @Enumerated(EnumType.STRING)
    @Column(name = "severidad", nullable = false, length = 20)
    private SeveridadAnuncio severidad;       // INFORMATIVO, IMPORTANTE, URGENTE, EMERGENCIA
    
    @Enumerated(EnumType.STRING)
    @Column(name = "alcance", nullable = false, length = 20)
    private AlcanceAnuncio alcance;           // NACIONAL, REGIONAL, COMUNAL
    
    @Column(name = "region", length = 100)
    private String region;                    // Ej: "Región Metropolitana" (opcional si alcance es NACIONAL)
    
    @Column(name = "vigente_desde", nullable = false)
    private OffsetDateTime vigenteDesde;      // Inicio de vigencia (default: now())
    
    @Column(name = "vigente_hasta")
    private OffsetDateTime vigenteHasta;      // Fin de vigencia (nullable)
    
    @Column(name = "creado_en", nullable = false)
    private OffsetDateTime creadoEn;          // Auto-set en @PrePersist
    
    // Métodos @PrePersist generan UUID, establecen timestamps
}
```

**Índices Recomendados (BD):**
```sql
CREATE INDEX idx_anuncios_emergencia_id ON anuncios(emergencia_id);
CREATE INDEX idx_anuncios_vigencia ON anuncios(vigente_desde, vigente_hasta);
CREATE INDEX idx_anuncios_severidad ON anuncios(severidad);
```

---

## 3. ENDPOINTS REST

### 3.1 ControladorEmergencias

**Base Path:** `/emergencies`  
**Tag:** "Emergencias"

#### 3.1.1 POST /emergencies — Declarar Emergencia

```
POST /emergencies HTTP/1.1
Authorization: Bearer <token_firebase>
Content-Type: application/json
```

**Permiso Requerido:** `EMERGENCIA_DECLARAR`

**Request Body:**
```json
{
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
}
```

**Response (201 Created):**
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
    "coordinates": [[[-70.680, -33.430], [-70.680, -33.445], [-70.660, -33.445], [-70.660, -33.430]]]
  },
  "declaradaPorUsuarioId": "user-uuid-123",
  "declaradaEn": "2026-05-09T14:30:00Z",
  "actualizadaEn": "2026-05-09T14:30:00Z"
}
```

**Códigos de Error:**
- `400` — Validación fallida (zona sin 4+ coordenadas, etc.)
- `401` — No autenticado
- `403` — Permiso insuficiente

**Eventos Publicados:** `emergency.created` (RabbitMQ)

---

#### 3.1.2 PATCH /emergencies/{id}/status — Cambiar Estado

```
PATCH /emergencies/550e8400-e29b-41d4-a716-446655440000/status HTTP/1.1
Authorization: Bearer <token_firebase>
Content-Type: application/json
```

**Permiso Requerido:** `EMERGENCIA_GESTIONAR`

**Request Body:**
```json
{
  "nuevoEstado": "CONTROLADA"
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tipo": "TERREMOTO",
  "severidad": "ALTA",
  "region": "Región Metropolitana",
  "estado": "CONTROLADA",
  ...
}
```

**Códigos de Error:**
- `404` — Emergencia no encontrada
- `409` — Transición de estado inválida (ej: FINALIZADA → ACTIVA)

**Transiciones Válidas:**
```
ACTIVA → CONTROLADA
ACTIVA → FINALIZADA
CONTROLADA → FINALIZADA
FINALIZADA → (ninguna, es terminal)
```

**Eventos Publicados:** `emergency.status.changed`

---

#### 3.1.3 GET /emergencies/active — Listar Emergencias Activas

```
GET /emergencies/active HTTP/1.1
```

**Público (sin autenticación)**

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tipo": "TERREMOTO",
    "severidad": "ALTA",
    "region": "Región Metropolitana",
    "estado": "ACTIVA",
    ...
  }
]
```

---

#### 3.1.4 GET /emergencies/active/geojson — Listar Polígonos GeoJSON

```
GET /emergencies/active/geojson HTTP/1.1
```

**Público (sin autenticación)**

**Response (200 OK) - FeatureCollection GeoJSON:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[-70.680, -33.430], ...]]
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

---

#### 3.1.5 GET /emergencies/{id} — Obtener Detalle

```
GET /emergencies/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Authorization: Bearer <token_firebase>
```

**Permiso Requerido:** `EMERGENCIA_GESTIONAR`

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  ...
}
```

**Códigos de Error:**
- `404` — Emergencia no encontrada

---

### 3.2 ControladorAnuncios

**Base Path:** `/announcements`  
**Tag:** "Anuncios"

#### 3.2.1 POST /announcements — Publicar Anuncio

```
POST /announcements HTTP/1.1
Authorization: Bearer <token_firebase>
Content-Type: application/json
```

**Permiso Requerido:** `ANUNCIO_PUBLICAR`

**Request Body:**
```json
{
  "emergenciaId": "550e8400-e29b-41d4-a716-446655440000",
  "titulo": "Evacuación obligatoria zona norte",
  "contenido": "<h2>Evacuación</h2><p>Se ordena evacuación inmediata...</p>",
  "severidad": "EMERGENCIA",
  "alcance": "REGIONAL",
  "region": "Región Metropolitana",
  "vigenteDesde": "2026-05-09T14:30:00Z",
  "vigenteHasta": "2026-05-10T14:30:00Z"
}
```

**Response (201 Created):**
```json
{
  "id": "anuncio-uuid-123",
  "emergenciaId": "550e8400-e29b-41d4-a716-446655440000",
  "autorUsuarioId": "user-uuid-123",
  "titulo": "Evacuación obligatoria zona norte",
  "contenido": "...",
  "severidad": "EMERGENCIA",
  "alcance": "REGIONAL",
  "region": "Región Metropolitana",
  "vigenteDesde": "2026-05-09T14:30:00Z",
  "vigenteHasta": "2026-05-10T14:30:00Z",
  "creadoEn": "2026-05-09T14:35:00Z"
}
```

**Códigos de Error:**
- `404` — Emergencia no encontrada
- `409` — Emergencia en estado FINALIZADA (no se pueden añadir anuncios)

**Eventos Publicados:** `announcement.published`

---

#### 3.2.2 GET /announcements — Listar Anuncios Vigentes

```
GET /announcements?page=0&size=20 HTTP/1.1
```

**Público (sin autenticación)**  
**Paginado:** Parámetros de Spring Data `page`, `size`, `sort`

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": "anuncio-uuid-123",
      "emergenciaId": "550e8400-e29b-41d4-a716-446655440000",
      "autorUsuarioId": "user-uuid-123",
      "titulo": "Evacuación obligatoria zona norte",
      ...
    }
  ],
  "pageable": {
    "size": 20,
    "number": 0,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Filtrado por Vigencia:**
- **Vigente:** `vigenteDesde <= NOW AND (vigenteHasta IS NULL OR vigenteHasta > NOW)`
- **Orden:** `severidad DESC, vigenteDesde DESC`

---

## 4. SERVICIOS Y LÓGICA

### 4.1 ServicioEmergencias

**Clase:** `cl.catastrofescl.emergencies.service.ServicioEmergencias`

#### Métodos

| Método | Transaccional | Descripción |
|--------|---------------|-------------|
| `declarar(DeclararEmergenciaRequest)` | ✅ | Crea emergencia, mapea geometrías, publica evento `emergency.created` |
| `cambiarEstado(UUID, CambiarEstadoEmergenciaRequest)` | ✅ | Valida transición, actualiza estado, publica `emergency.status.changed` |
| `obtener(UUID)` | 🔒 ReadOnly | Obtiene emergencia por ID, mapea a response |
| `listarActivas()` | 🔒 ReadOnly | Listado de emergencias en estado ACTIVA ordenadas desc por fecha |
| `listarGeoJsonActivas()` | 🔒 ReadOnly | Retorna FeatureCollection GeoJSON de polígonos activos |

#### Flujos de Negocio Clave

**Declaración de Emergencia:**
1. Obtiene usuario ID del contexto autenticado
2. Mapea `DeclararEmergenciaRequest` → `Emergencia` entity
3. Convierte coordenadas en geometrías JTS (Point, Polygon)
4. Persiste en BD
5. Publica evento `EmergenciaCreadaEvento` en RabbitMQ con datos completos
6. Retorna `EmergenciaResponse`

**Cambio de Estado:**
1. Carga emergencia por ID
2. Valida transición con `estadoActual.puedeTransicionarA(estadoNuevo)`
3. Si transición inválida → lanza `TransicionEstadoInvalidaException`
4. Actualiza estado
5. Publica evento `EstadoEmergenciaCambiadoEvento`
6. Retorna respuesta actualizada

---

### 4.2 ServicioAnuncios

**Clase:** `cl.catastrofescl.emergencies.service.ServicioAnuncios`

#### Métodos

| Método | Transaccional | Descripción |
|--------|---------------|-------------|
| `publicar(PublicarAnuncioRequest)` | ✅ | Valida emergencia (no FINALIZADA), crea anuncio, publica evento |
| `listarVigentes(Pageable)` | 🔒 ReadOnly | Retorna Page de anuncios vigentes en el momento de la consulta |

#### Validaciones

- Emergencia debe existir
- Emergencia NO debe estar en estado `FINALIZADA`
- `vigenteDesde` por defecto = ahora (si no se proporciona)
- `vigenteHasta` puede ser null (indefinida)

---

### 4.3 PublicadorEventos

**Clase:** `cl.catastrofescl.emergencies.service.PublicadorEventos`

**Responsabilidad:** Publicar eventos de dominio en RabbitMQ.

```java
public void publicar(EventoDominio evento) {
    rabbitTemplate.convertAndSend(
        exchangeTopic,                    // "catastrofescl.events"
        evento.getRoutingKey(),          // "emergency.created", etc.
        evento,                          // Serializado a JSON
        mensaje -> {
            mensaje.getMessageProperties().setMessageId(evento.getEventoId().toString());
            mensaje.getMessageProperties().setCorrelationId(evento.getCorrelacionId());
            mensaje.getMessageProperties().setContentType("application/json");
            return mensaje;
        }
    );
}
```

---

### 4.4 MapeadorEmergencias

**Responsabilidad:** Convertir `Emergencia` entity → `EmergenciaResponse` DTO

Mapea geometrías JTS a DTO GeoJSON.

---

### 4.5 GeometriaMapper

**Responsabilidad:** Convertir entre DTOs geométricos y objetos JTS.

| Método | Convierte |
|--------|-----------|
| `aPunto(CoordenadaDto)` | CoordenadaDto → JTS Point (SRID 4326) |
| `aPoligono(List<CoordenadaDto>)` | Lista coords → JTS Polygon (SRID 4326) |

**Validaciones:**
- Valida que polígono sea cerrado (primer punto = último punto)
- Valida al menos 4 coordenadas (triángulo + cierre)

---

## 5. REPOSITORIOS

### 5.1 RepositorioEmergencias

**Interface:** `cl.catastrofescl.emergencies.repository.RepositorioEmergencias`  
**Extends:** `JpaRepository<Emergencia, UUID>`

#### Métodos

```java
// Encuentra todas las emergencias de un estado específico, ordenadas por fecha desc
List<Emergencia> findByEstadoOrderByDeclaradaEnDesc(EstadoEmergencia estado);

// Query nativa que retorna proyección minimizada con geometrías en GeoJSON
@Query("""
    SELECT
        id, tipo, severidad, region, estado, declarada_en,
        ST_AsGeoJSON(zona_impacto::geometry) AS "zonaImpactoGeoJson"
    FROM emergencias
    WHERE estado = 'ACTIVA'
      AND zona_impacto IS NOT NULL
    ORDER BY declarada_en DESC
    """, nativeQuery = true)
List<ProyeccionPoligonoEmergenciaActiva> listarPoligonosActivosGeoJson();
```

**Acceso Implícito (heredado de JpaRepository):**
- `findById(UUID)`
- `save(Emergencia)`
- `saveAll(Iterable<Emergencia>)`
- `delete(Emergencia)`
- `deleteById(UUID)`

---

### 5.2 RepositorioAnuncios

**Interface:** `cl.catastrofescl.emergencies.repository.RepositorioAnuncios`  
**Extends:** `JpaRepository<Anuncio, UUID>`

#### Métodos

```java
// Retorna anuncios vigentes en un momento dado, paginado
@Query("""
    SELECT a FROM Anuncio a
    WHERE a.vigenteDesde <= :ahora
      AND (a.vigenteHasta IS NULL OR a.vigenteHasta > :ahora)
    ORDER BY a.severidad DESC, a.vigenteDesde DESC
    """)
Page<Anuncio> listarVigentes(@Param("ahora") OffsetDateTime ahora, Pageable pageable);
```

**Acceso Implícito:**
- Métodos estándar JpaRepository

---

### 5.3 ProyeccionPoligonoEmergenciaActiva

**Interface:** Proyección para la query nativa de polígonos GeoJSON.

```java
public interface ProyeccionPoligonoEmergenciaActiva {
    UUID getId();
    TipoEmergencia getTipo();
    SeveridadEmergencia getSeveridad();
    String getRegion();
    EstadoEmergencia getEstado();
    OffsetDateTime getDeclaradaEn();
    String getZonaImpactoGeoJson();  // JSON string de GeoJSON Polygon
}
```

---

## 6. MENSAJERÍA RABBITMQ

### 6.1 Configuración (RabbitMQConfig)

```yaml
catastrofescl:
  rabbitmq:
    exchange-topic: "catastrofescl.events"    # Topic Exchange principal
    exchange-dlx: "catastrofescl.dlx"         # Dead Letter Exchange
```

### 6.2 Exchanges

| Nombre | Tipo | Propósito |
|--------|------|----------|
| `catastrofescl.events` | **Topic** | Distribuye eventos por routing key (`#.created`, `#.status.*`, etc.) |
| `catastrofescl.dlx` | **Direct** | Maneja mensajes que no pueden procesarse (DLX) |

### 6.3 Eventos Publicados

#### 6.3.1 `emergency.created` (EmergenciaCreadaEvento)

**Routing Key:** `emergency.created`

**Payload JSON:**
```json
{
  "eventoId": "uuid-del-evento",
  "ocurridoEn": "2026-05-09T14:30:00Z",
  "correlacionId": "id-emergencia",
  "versionEvento": "1.0",
  "fuente": "ms-emergencies",
  
  "emergenciaId": "550e8400-e29b-41d4-a716-446655440000",
  "tipo": "TERREMOTO",
  "severidad": "ALTA",
  "estado": "ACTIVA",
  "region": "Región Metropolitana",
  "resumen": "Emergencia TERREMOTO de severidad ALTA declarada en Región Metropolitana",
  "declaradaPorUsuarioId": "user-uuid-123"
}
```

**Consumidores Esperados:**
- `ms-resources` — Para alerta de recursos
- `ms-logistics` — Para movilización de centros
- `ms-notifications` — Para notificaciones a usuarios

---

#### 6.3.2 `emergency.status.changed` (EstadoEmergenciaCambiadoEvento)

**Routing Key:** `emergency.status.changed`

**Payload JSON:**
```json
{
  "eventoId": "uuid-del-evento",
  "ocurridoEn": "2026-05-09T15:00:00Z",
  "correlacionId": "id-emergencia",
  
  "emergenciaId": "550e8400-e29b-41d4-a716-446655440000",
  "estadoAnterior": "ACTIVA",
  "estadoNuevo": "CONTROLADA",
  "actualizadaPorUsuarioId": "user-uuid-123"
}
```

---

#### 6.3.3 `announcement.published` (AnuncioPublicadoEvento)

**Routing Key:** `announcement.published`

**Payload JSON:**
```json
{
  "eventoId": "uuid-del-evento",
  "ocurridoEn": "2026-05-09T14:35:00Z",
  "correlacionId": "id-anuncio",
  "versionEvento": "1.0",
  "fuente": "ms-emergencies",
  
  "anuncioId": "anuncio-uuid-123",
  "emergenciaId": "550e8400-e29b-41d4-a716-446655440000",
  "autorUsuarioId": "user-uuid-123",
  "severidad": "EMERGENCIA",
  "alcance": "REGIONAL",
  "region": "Región Metropolitana",
  "titulo": "Evacuación obligatoria zona norte",
  "contenido": "<h2>Evacuación</h2>...",
  "vigenteDesde": "2026-05-09T14:30:00Z",
  "vigenteHasta": "2026-05-10T14:30:00Z"
}
```

---

### 6.4 Eventos Consumidos

**MS-Emergencias NO consume eventos de otros microservicios en esta versión.**

(Potencialmente podría escuchar `user.created`, `user.role.changed` para sincronización de permisos, pero actualmente mantiene permisos en cache local.)

---

### 6.5 Message Converter

```java
@Bean
public MessageConverter messageConverter() {
    ObjectMapper mapper = new ObjectMapper();
    mapper.registerModule(new JavaTimeModule());  // Soporte para OffsetDateTime
    mapper.configure(WRITE_DATES_AS_TIMESTAMPS, false);  // Formato ISO 8601
    return new Jackson2JsonMessageConverter(mapper);
}
```

---

## 7. DTOs

### 7.1 Request DTOs

#### 7.1.1 DeclararEmergenciaRequest

```java
public record DeclararEmergenciaRequest(
    @NotNull TipoEmergencia tipo,
    @NotNull SeveridadEmergencia severidad,
    @NotBlank @Size(max = 100) String region,
    
    @Valid CoordenadaDto epicentro,
    
    @Valid @Size(min = 4, message = "La zona de impacto debe tener al menos 4 coordenadas y formar un anillo cerrado")
    List<CoordenadaDto> zonaImpacto  // Opcional pero debe ser anillo cerrado si se proporciona
) {}
```

---

#### 7.1.2 CambiarEstadoEmergenciaRequest

```java
public record CambiarEstadoEmergenciaRequest(
    @NotNull EstadoEmergencia nuevoEstado
) {}
```

---

#### 7.1.3 PublicarAnuncioRequest

```java
public record PublicarAnuncioRequest(
    @NotNull UUID emergenciaId,
    
    @NotBlank @Size(max = 200) String titulo,
    @NotBlank String contenido,
    
    @NotNull SeveridadAnuncio severidad,
    @NotNull AlcanceAnuncio alcance,
    
    @Size(max = 100) String region,
    
    OffsetDateTime vigenteDesde,  // Opcional, default = now()
    OffsetDateTime vigenteHasta   // Opcional, indefinida si null
) {}
```

---

### 7.2 Response DTOs

#### 7.2.1 EmergenciaResponse

```java
public record EmergenciaResponse(
    UUID id,
    TipoEmergencia tipo,
    SeveridadEmergencia severidad,
    String region,
    EstadoEmergencia estado,
    GeoJsonPuntoDto coordenadasEpicentro,    // Serializado como GeoJSON Point
    GeoJsonPoligonoDto zonaImpacto,          // Serializado como GeoJSON Polygon
    UUID declaradaPorUsuarioId,
    OffsetDateTime declaradaEn,
    OffsetDateTime actualizadaEn
) {}
```

---

#### 7.2.2 AnuncioResponse

```java
public record AnuncioResponse(
    UUID id,
    UUID emergenciaId,
    UUID autorUsuarioId,
    String titulo,
    String contenido,
    SeveridadAnuncio severidad,
    AlcanceAnuncio alcance,
    String region,
    OffsetDateTime vigenteDesde,
    OffsetDateTime vigenteHasta,
    OffsetDateTime creadoEn
) {}
```

---

### 7.3 Geometría DTOs

#### 7.3.1 CoordenadaDto

```java
public record CoordenadaDto(
    @NotNull
    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    Double longitud,
    
    @NotNull
    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    Double latitud
) {}
```

---

#### 7.3.2 GeoJsonPuntoDto

```java
public record GeoJsonPuntoDto(
    String type,                // "Point"
    List<Double> coordinates    // [longitud, latitud]
) {
    public static GeoJsonPuntoDto de(double longitud, double latitud) {
        return new GeoJsonPuntoDto("Point", List.of(longitud, latitud));
    }
}
```

---

#### 7.3.3 GeoJsonPoligonoDto

```java
public record GeoJsonPoligonoDto(
    String type,                                // "Polygon"
    List<List<List<Double>>> coordinates        // [ [ [lng, lat], ... ] ]
) {
    public static GeoJsonPoligonoDto de(List<List<Double>> anilloExterior) {
        return new GeoJsonPoligonoDto("Polygon", List.of(anilloExterior));
    }
}
```

---

### 7.4 Response DTOs GeoJSON (Mapa)

#### 7.4.1 ColeccionGeoJsonEmergenciasResponse

```java
public record ColeccionGeoJsonEmergenciasResponse(
    String type,                                                    // "FeatureCollection"
    List<CaracteristicaGeoJsonEmergenciaResponse> features
) {}
```

---

#### 7.4.2 CaracteristicaGeoJsonEmergenciaResponse

```java
public record CaracteristicaGeoJsonEmergenciaResponse(
    String type,                                                    // "Feature"
    GeoJsonPoligonoDto geometry,
    PropiedadesPoligonoEmergenciaResponse properties
) {}
```

---

#### 7.4.3 PropiedadesPoligonoEmergenciaResponse

```java
public record PropiedadesPoligonoEmergenciaResponse(
    UUID id,
    TipoEmergencia tipo,
    SeveridadEmergencia severidad,
    String region,
    EstadoEmergencia estado,
    OffsetDateTime declaradaEn
) {}
```

---

## 8. EXCEPCIONES Y ERRORES

### 8.1 Excepciones Personalizadas

| Excepción | Código HTTP | Descripción |
|-----------|-------------|-------------|
| `EmergenciaNoEncontradaException` | 404 | Emergencia con ID no existe |
| `EmergenciaNoActivaException` | 409 | Operación rechazada: emergencia en estado FINALIZADA |
| `AnuncioNoEncontradoException` | 404 | Anuncio con ID no existe |
| `TransicionEstadoInvalidaException` | 409 | Transición de estado no permitida (ej: FINALIZADA → ACTIVA) |
| `GeometriaInvalidaException` | 400 | Geometría inválida (polígono mal formado, coords inválidas) |

---

### 8.2 Global Exception Handler (ManejadorGlobalExcepciones)

```java
@ControllerAdvice
public class ManejadorGlobalExcepciones {
    
    @ExceptionHandler(EmergenciaNoEncontradaException.class)
    public ProblemDetail handleEmergenciaNoEncontrada(EmergenciaNoEncontradaException ex, HttpServletRequest request) {
        // Retorna ProblemDetail (RFC 7231) con status 404
    }
    
    @ExceptionHandler(TransicionEstadoInvalidaException.class)
    public ProblemDetail handleTransicionInvalida(TransicionEstadoInvalidaException ex, HttpServletRequest request) {
        // Retorna ProblemDetail con status 409
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        // Retorna ProblemDetail con detalles de validación (status 400)
    }
}
```

---

## 9. CONFIGURACIÓN

### 9.1 application.yml

```yaml
spring:
  application:
    name: ms-emergencies
  profiles:
    active: dev
  jpa:
    hibernate:
      ddl-auto: validate          # Valida esquema sin modificar
    open-in-view: false           # Lazy loading deshabilitado
  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration
  jackson:
    default-property-inclusion: non_null
    serialization:
      write-dates-as-timestamps: false  # ISO 8601 format

server:
  port: 8082
  servlet:
    context-path: /

springdoc:
  swagger-ui:
    path: /swagger-ui.html
    operations-sorter: method

management:
  endpoints:
    web:
      exposure:
        include: health, info

catastrofescl:
  rabbitmq:
    exchange-topic: catastrofescl.events
    exchange-dlx: catastrofescl.dlx
  firebase:
    enabled: false                # Activar en producción
  auth:
    dev-mode: false               # Activar en desarrollo local
    public-paths:
      - /emergencies/active
      - /announcements
      - /actuator/health
      - /v3/api-docs/**
      - /swagger-ui/**
      - /swagger-ui.html
  cors:
    allowed-origins: http://localhost:3000
```

---

### 9.2 Perfil Development (application-dev.yml)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/catastrofescl_ms_emergencies
    username: catastrofescl_user
    password: password_dev
  jpa:
    show-sql: false
    properties:
      hibernate:
        format_sql: false
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest

catastrofescl:
  auth:
    dev-mode: true               # Usar FiltroAutenticacionDev
```

---

### 9.3 Perfil Production (application-prod.yml)

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USER}
    password: ${DB_PASSWORD}
  jpa:
    show-sql: false
  rabbitmq:
    host: ${RABBITMQ_HOST}
    port: ${RABBITMQ_PORT}
    username: ${RABBITMQ_USER}
    password: ${RABBITMQ_PASSWORD}

catastrofescl:
  firebase:
    enabled: true
  auth:
    dev-mode: false
    public-paths:
      - /emergencies/active
      - /announcements
      - /actuator/health
      - /v3/api-docs/**
      - /swagger-ui/**
  cors:
    allowed-origins: ${CORS_ORIGINS}
```

---

### 9.4 Clases de Configuración Spring

| Clase | Responsabilidad |
|-------|-----------------|
| `RabbitMQConfig` | Declares Topic Exchange, DLX, MessageConverter, RabbitTemplate |
| `SeguridadConfig` | Security filter chain, CORS, RBAC (@EnableMethodSecurity) |
| `FirebaseConfig` | Inicializa Firebase Admin SDK (si enabled=true) |
| `RedisConfig` | Configuración de Redis para cache/idempotencia |
| `OpenApiConfig` | Configuración de OpenAPI/Swagger |

---

## 10. ENUMS

### 10.1 TipoEmergencia

```java
public enum TipoEmergencia {
    TERREMOTO,    // Sismos
    TSUNAMI,      // Olas del mar
    INCENDIO,     // Fuegos
    INUNDACION,   // Desbordamientos
    ERUPCION,     // Volcánica
    ALUVION       // Aludes
}
```

---

### 10.2 SeveridadEmergencia

```java
public enum SeveridadEmergencia {
    BAJA,          // Daños mínimos
    MEDIA,         // Daños moderados
    ALTA,          // Daños mayores
    CATASTROFICA   // Daños catastróficos
}
```

---

### 10.3 EstadoEmergencia

```java
public enum EstadoEmergencia {
    ACTIVA,      // Emergencia en curso
    CONTROLADA,  // Bajo control
    FINALIZADA;  // Resuelto, cerrado
    
    public Set<EstadoEmergencia> transicionesPermitidas() {
        return switch (this) {
            case ACTIVA -> Set.of(CONTROLADA, FINALIZADA);
            case CONTROLADA -> Set.of(FINALIZADA);
            case FINALIZADA -> Set.of();  // Terminal
        };
    }
    
    public boolean puedeTransicionarA(EstadoEmergencia destino) {
        return transicionesPermitidas().contains(destino);
    }
}
```

---

### 10.4 SeveridadAnuncio

```java
public enum SeveridadAnuncio {
    INFORMATIVO,   // Noticia general
    IMPORTANTE,    // Requiere atención
    URGENTE,       // Acción inmediata
    EMERGENCIA     // Máxima prioridad
}
```

---

### 10.5 AlcanceAnuncio

```java
public enum AlcanceAnuncio {
    NACIONAL,     // Todo el país
    REGIONAL,     // Una región específica
    COMUNAL       // Comunidad/ciudad específica
}
```

---

## 11. SEGURIDAD Y PERMISOS

### 11.1 Permisos del Dominio (ProveedorPermisos)

```
┌─────────────────┬──────────────────────────────────────────────┐
│ Rol             │ Permisos (EMERGENCIAS)                       │
├─────────────────┼──────────────────────────────────────────────┤
│ ADMINISTRADOR   │ EMERGENCIA_DECLARAR, EMERGENCIA_GESTIONAR,   │
│                 │ ANUNCIO_PUBLICAR                             │
├─────────────────┼──────────────────────────────────────────────┤
│ AUTORIDAD       │ EMERGENCIA_DECLARAR, EMERGENCIA_GESTIONAR,   │
│                 │ ANUNCIO_PUBLICAR                             │
├─────────────────┼──────────────────────────────────────────────┤
│ OPERADOR        │ (ninguno para emergencias)                    │
├─────────────────┼──────────────────────────────────────────────┤
│ PARTICULAR      │ (ninguno para emergencias)                    │
├─────────────────┼──────────────────────────────────────────────┤
│ VOLUNTARIO      │ (ninguno para emergencias)                    │
└─────────────────┴──────────────────────────────────────────────┘
```

---

### 11.2 Endpoints Públicos (sin autenticación)

```
GET  /emergencies/active          → Listado de emergencias activas
GET  /emergencies/active/geojson  → GeoJSON de polígonos
GET  /announcements                → Anuncios vigentes paginados
GET  /actuator/health
GET  /v3/api-docs/**
GET  /swagger-ui/**
```

---

### 11.3 Endpoints Protegidos (requieren token)

```
POST /emergencies                  → Requiere EMERGENCIA_DECLARAR
PATCH /emergencies/{id}/status    → Requiere EMERGENCIA_GESTIONAR
GET  /emergencies/{id}            → Requiere EMERGENCIA_GESTIONAR
POST /announcements               → Requiere ANUNCIO_PUBLICAR
```

---

### 11.4 Autenticación

- **Modo Producción:** Firebase Admin SDK (verifica tokens JWT)
- **Modo Desarrollo:** Headers `X-Dev-User-Id`, `X-Dev-Roles` (para testing)

---

## 12. MIGRACIONES FLYWAY

### Archivos Esperados

```
src/main/resources/db/migration/
├── V1__create_emergencias_table.sql
├── V2__create_anuncios_table.sql
└── ...
```

### Ejemplo: V1__create_emergencias_table.sql

```sql
CREATE TABLE IF NOT EXISTS emergencias (
    id UUID PRIMARY KEY NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    severidad VARCHAR(20) NOT NULL,
    region VARCHAR(100) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    coordenadas_epicentro GEOGRAPHY(Point, 4326),
    zona_impacto GEOGRAPHY(Polygon, 4326),
    declarada_por_usuario_id UUID NOT NULL,
    declarada_en TIMESTAMP WITH TIME ZONE NOT NULL,
    actualizada_en TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT chk_estado CHECK (estado IN ('ACTIVA', 'CONTROLADA', 'FINALIZADA'))
);

CREATE INDEX idx_emergencias_estado ON emergencias(estado);
CREATE INDEX idx_emergencias_tipo ON emergencias(tipo);
CREATE INDEX idx_emergencias_zona_impacto ON emergencias USING GIST(zona_impacto);
CREATE INDEX idx_emergencias_epicentro ON emergencias USING GIST(coordenadas_epicentro);
```

---

## 13. FLUJOS DE NEGOCIO COMPLETOS

### 13.1 Flujo: Declaración de Emergencia

```
1. USUARIO (ADMINISTRADOR/AUTORIDAD)
   │
   ├─ POST /emergencies
   └─ Authorization: Bearer <firebase_token>
      ├─ Body: DeclararEmergenciaRequest
      │   ├─ tipo: TERREMOTO
      │   ├─ severidad: ALTA
      │   ├─ region: "Región Metropolitana"
      │   ├─ epicentro: {lng, lat}
      │   └─ zonaImpacto: [{lng1,lat1}, {lng2,lat2}, ...]
      │
      └─ SERVICIO: ServicioEmergencias.declarar()
         ├─ Obtiene usuarioId del token
         ├─ Mapea Request → Entity
         ├─ Convierte coordenadas → geometrías JTS
         ├─ Persiste en BD (emergencias)
         ├─ Publica evento RabbitMQ: emergency.created
         │   └─ Consumido por: ms-resources, ms-logistics, ms-notifications
         └─ Retorna EmergenciaResponse (201 Created)

2. RESULTADO
   ├─ Emergencia creada en BD
   ├─ UUID asignado
   ├─ Estado: ACTIVA
   ├─ Otros microservicios notificados
   └─ Mapa actualizado (vía GET /emergencies/active/geojson)
```

---

### 13.2 Flujo: Cambio de Estado

```
1. USUARIO (ADMINISTRADOR/AUTORIDAD)
   │
   ├─ PATCH /emergencies/{id}/status
   └─ Authorization: Bearer <firebase_token>
      ├─ Body: CambiarEstadoEmergenciaRequest
      │   └─ nuevoEstado: CONTROLADA
      │
      └─ SERVICIO: ServicioEmergencias.cambiarEstado()
         ├─ Carga emergencia
         ├─ Valida transición (ACTIVA → CONTROLADA) ✓
         ├─ Actualiza estado
         ├─ Publica evento: emergency.status.changed
         └─ Retorna EmergenciaResponse (200 OK)

2. RESULTADO
   ├─ Estado actualizado en BD
   ├─ Evento publicado
   └─ Lógica relacionada (ej: ms-logistics) responde
```

---

### 13.3 Flujo: Publicación de Anuncio

```
1. USUARIO (ADMINISTRADOR/AUTORIDAD)
   │
   ├─ POST /announcements
   └─ Authorization: Bearer <firebase_token>
      ├─ Body: PublicarAnuncioRequest
      │   ├─ emergenciaId: <id-emergencia>
      │   ├─ titulo: "Evacuación obligatoria"
      │   ├─ contenido: "<h2>Instrucciones</h2>..."
      │   ├─ severidad: EMERGENCIA
      │   ├─ alcance: REGIONAL
      │   └─ vigenteDesde/vigenteHasta: (timestamps)
      │
      └─ SERVICIO: ServicioAnuncios.publicar()
         ├─ Valida que emergencia existe
         ├─ Valida que emergencia NO está FINALIZADA
         ├─ Crea Anuncio entity
         ├─ Persiste en BD (anuncios)
         ├─ Publica evento: announcement.published
         │   └─ Consumido por: ms-notifications
         └─ Retorna AnuncioResponse (201 Created)

2. RESULTADO
   ├─ Anuncio creado en BD
   ├─ Visible al público via GET /announcements (si vigente)
   └─ Usuarios notificados (push, email, SMS)
```

---

### 13.4 Flujo: Consulta de Anuncios Vigentes (PÚBLICO)

```
1. USUARIO (sin autenticación)
   │
   ├─ GET /announcements?page=0&size=20
   │
   └─ SERVICIO: ServicioAnuncios.listarVigentes()
      ├─ Consulta BD: SELECT WHERE vigenteDesde <= NOW AND (vigenteHasta IS NULL OR > NOW)
      ├─ Ordena por severidad DESC, vigenteDesde DESC
      ├─ Aplica paginación (20 por página)
      └─ Retorna Page<AnuncioResponse> (200 OK)

2. RESULTADO
   └─ JSON paginado con anuncios activos
      {
        "content": [...],
        "pageable": { "size": 20, "number": 0, ... },
        "totalElements": 5,
        "totalPages": 1
      }
```

---

## 14. CONSIDERACIONES DE DESARROLLO

### 14.1 Testing

- **Tests Unitarios:** `ServicioEmergenciasTest`, `ServicioAnunciosTest`
- **Tests de Geometría:** `GeometriaMapperTest`
- **Tests de Integración:** `EmergenciasIntegracionTest` (TestContainers con PostgreSQL + PostGIS)
- **Tests de Seguridad:** `ProveedorPermisosTest`

---

### 14.2 Caching

- **Redis:** Usado para cache de permisos y potencial idempotencia
- **TTL:** Configurable por perfil

---

### 14.3 Observabilidad

- **Health Check:** `/actuator/health`
- **Info:** `/actuator/info`
- **API Docs:** `/v3/api-docs`, `/swagger-ui.html`
- **Logs:** SLF4J con patrón `@Slf4j`

---

### 14.4 Validación de Datos

- **Annotations:** `@Valid`, `@NotNull`, `@NotBlank`, `@DecimalMin/Max`, `@Size`
- **Global Exception Handler:** Devuelve `ProblemDetail` (RFC 7231)

---

### 14.5 Transaccionalidad

- **@Transactional(readOnly = true)** en queries
- **@Transactional** en commands (declarar, cambiarEstado, publicar)

---

## 15. REFERENCIAS Y CONVERSIÓN ENTRE CAPAS

### Flow: Request → Response

```
Request JSON
    ↓
ControladorEmergencias (mapea HTTP)
    ↓
DeclararEmergenciaRequest (DTO validado)
    ↓
ServicioEmergencias.declarar()
    ├─ Mapea → Emergencia (entity)
    ├─ Persiste
    ├─ Mapea → EmergenciaResponse
    └─ Publica evento
    ↓
EmergenciaResponse (record)
    ↓
Jackson serializa a JSON
    ↓
Response HTTP 201/200
```

---

## 16. PRÓXIMAS FASES (Roadmap)

- [ ] Sincronización de permisos desde ms-identity (escuchar eventos `role.changed`)
- [ ] Implementar Dead Letter Queue (DLQ) para eventos fallidos
- [ ] Agregar filtro geoespacial: `GET /emergencies/active?bbox=...`
- [ ] Versioning de API (v1, v2)
- [ ] Audit trail de cambios de emergencias
- [ ] Notificaciones push en tiempo real vía WebSocket

---

**FIN DEL ANÁLISIS**

---

### Notas Importantes

1. **Permisos Temporales:** Los permisos están hardcoded en `ProveedorPermisos`. Próximamente se consultarán desde ms-identity.

2. **Firebase:** Actualmente deshabilitado (`enabled: false`). En producción se habilitará y se verificarán tokens JWT.

3. **PostGIS:** Requiere extensión `postgis` en PostgreSQL. Las queries geoespaciales usan `ST_AsGeoJSON`.

4. **RabbitMQ:** Todos los eventos son publicados en el topic exchange `catastrofescl.events`. Los consumidores están en otros microservicios.

5. **API Pública:** Endpoints de listado (`/active`, `/announcements`) son públicos para dashboard de ciudadanos sin login.
