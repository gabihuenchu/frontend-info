# 🏗️ MS-EMERGENCIAS - ARQUITECTURA Y ESTRUCTURA

---

## DIAGRAMA DE CAPAS

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  Frontend (Next.js)  →  Mobile App  →  External APIs           │
└──────────────────────────┬──────────────────────────────────────┘
                          │
                    HTTP(S) JSON
                          │
┌──────────────────────────▼──────────────────────────────────────┐
│                    API GATEWAY LAYER                             │
│  (MS-Api-Gateway) → Routing, Rate Limiting, Auth Delegation    │
└──────────────────────────┬──────────────────────────────────────┘
                          │
                    HTTP/JSON
                          │
┌──────────────────────────▼──────────────────────────────────────┐
│              MS-EMERGENCIES (REST Controllers)                   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ControladorEmergencias  │  ControladorAnuncios         │   │
│  │  /emergencies            │  /announcements              │   │
│  └──────────┬────────────────────────────┬────────────────┘   │
│             │                            │                      │
│  ┌──────────▼────────────────────────────▼────────────────┐   │
│  │              SERVICE LAYER                              │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ ServicioEmergencias                              │  │   │
│  │  │  - declarar()                                    │  │   │
│  │  │  - cambiarEstado()                               │  │   │
│  │  │  - obtener()                                     │  │   │
│  │  │  - listarActivas()                               │  │   │
│  │  │  - listarGeoJsonActivas()                         │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ ServicioAnuncios                                 │  │   │
│  │  │  - publicar()                                    │  │   │
│  │  │  - listarVigentes()                              │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ PublicadorEventos                                │  │   │
│  │  │  - publicar(EventoDominio)                       │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ Mappers (MapeadorEmergencias, GeometriaMapper)  │  │   │
│  │  │  - Entity ↔ DTO conversions                      │  │   │
│  │  │  - JTS ↔ DTO geometry conversions                │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └───────────────┬──────────────────────────────────────────┘   │
│                  │                                              │
│  ┌───────────────▼──────────────────────────────────────────┐  │
│  │         REPOSITORY LAYER (Spring Data JPA)              │  │
│  │                                                           │  │
│  │  ┌────────────────────────┐  ┌────────────────────────┐ │  │
│  │  │ RepositorioEmergencias │  │ RepositorioAnuncios   │ │  │
│  │  │                        │  │                        │ │  │
│  │  │ findByEstado()         │  │ listarVigentes()      │ │  │
│  │  │ listarPoligonos...()   │  │ findById() (inherited) │ │  │
│  │  └────────────────────────┘  └────────────────────────┘ │  │
│  └───────────────┬──────────────────────────────────────────┘  │
│                  │                                              │
└──────────────────┼──────────────────────────────────────────────┘
                   │
          JDBC / JPA ORM (Hibernate)
                   │
┌──────────────────▼──────────────────────────────────────────────┐
│              PERSISTENCE LAYER                                   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                    │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐    │   │
│  │  │ Table: emergencias   │  │ Table: anuncios      │    │   │
│  │  │  - UUID id           │  │  - UUID id           │    │   │
│  │  │  - tipo (enum)       │  │  - emergencia_id (FK)│    │   │
│  │  │  - severidad (enum)  │  │  - titulo, contenido │    │   │
│  │  │  - estado (enum)     │  │  - severidad (enum)  │    │   │
│  │  │  - region            │  │  - alcance (enum)    │    │   │
│  │  │  - Point epicentro   │  │  - vigencia (dates)  │    │   │
│  │  │  - Polygon zona      │  │  - creadoEn          │    │   │
│  │  │  - timestamps        │  │  - timestamps        │    │   │
│  │  └──────────────────────┘  └──────────────────────┘    │   │
│  │                                                          │   │
│  │  PostGIS Extension (Geospatial Queries)                │   │
│  │  - ST_AsGeoJSON()                                      │   │
│  │  - GIST Indexes on geometries                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## FLUJO DE DATOS

### A. Declaración de Emergencia

```
Request HTTP
    ↓
ControladorEmergencias.declarar()
    ↓
Valida @Valid DeclararEmergenciaRequest
    ├─ Si error → ProblemDetail (400)
    └─ Si OK ↓
ServicioEmergencias.declarar()
    ├─ Extrae usuarioId (ContextoUsuario)
    ├─ Mapea Request → Emergencia entity
    ├─ GeometriaMapper convierte CoordenadaDto → JTS Point/Polygon
    ├─ Persiste en BD (RepositorioEmergencias.save())
    ├─ PublicadorEventos.publicar(EmergenciaCreadaEvento)
    │   └─ RabbitMQ: emergency.created event
    ├─ MapeadorEmergencias convierte entity → EmergenciaResponse
    └─ Retorna ResponseEntity<EmergenciaResponse> (201)
    ↓
Response JSON
```

---

### B. Cambio de Estado

```
Request HTTP (PATCH)
    ↓
ControladorEmergencias.cambiarEstado()
    ↓
ServicioEmergencias.cambiarEstado()
    ├─ Carga Emergencia por ID
    ├─ Valida transición (EstadoEmergencia.puedeTransicionarA())
    │   ├─ Si inválida → TransicionEstadoInvalidaException (409)
    │   └─ Si válida ↓
    ├─ Actualiza estado
    ├─ Persiste en BD
    ├─ PublicadorEventos.publicar(EstadoEmergenciaCambiadoEvento)
    │   └─ RabbitMQ: emergency.status.changed event
    ├─ Mapea a response
    └─ Retorna EmergenciaResponse (200)
    ↓
Response JSON
```

---

### C. Publicación de Anuncio

```
Request HTTP
    ↓
ControladorAnuncios.publicar()
    ↓
Valida @Valid PublicarAnuncioRequest
    ├─ Si error → ProblemDetail (400)
    └─ Si OK ↓
ServicioAnuncios.publicar()
    ├─ Carga Emergencia por emergenciaId
    │   ├─ Si no existe → EmergenciaNoEncontradaException (404)
    │   ├─ Si FINALIZADA → EmergenciaNoActivaException (409)
    │   └─ Si OK ↓
    ├─ Obtiene autorId (ContextoUsuario)
    ├─ Crea Anuncio entity (vigenteDesde default = now())
    ├─ Persiste en BD
    ├─ PublicadorEventos.publicar(AnuncioPublicadoEvento)
    │   └─ RabbitMQ: announcement.published event
    ├─ Mapea a response
    └─ Retorna ResponseEntity<AnuncioResponse> (201)
    ↓
Response JSON
```

---

### D. Consulta de Anuncios Vigentes (PÚBLICO)

```
Request HTTP (GET /announcements)
    ↓
ControladorAnuncios.listarVigentes()
    ├─ Extrae Pageable (page=0, size=20)
    └─ ServicioAnuncios.listarVigentes()
        ├─ RepositorioAnuncios.listarVigentes(NOW(), pageable)
        │   └─ Query:
        │       WHERE vigenteDesde <= NOW
        │       AND (vigenteHasta IS NULL OR vigenteHasta > NOW)
        │       ORDER BY severidad DESC, vigenteDesde DESC
        ├─ Mapea cada Anuncio → AnuncioResponse
        └─ Retorna Page<AnuncioResponse>
    ↓
Response JSON (paginado)
```

---

## MATRIZ DE RESPONSABILIDADES

| Clase/Componente | Responsabilidad | Ubicación |
|---|---|---|
| **ControladorEmergencias** | Mapeo HTTP, validación @Valid, delegación a servicio | controller/ |
| **ControladorAnuncios** | Mapeo HTTP, validación @Valid, delegación a servicio | controller/ |
| **ServicioEmergencias** | Lógica de negocio de emergencias (CRUD, transiciones, queries) | service/ |
| **ServicioAnuncios** | Lógica de negocio de anuncios (publicación, vigencia) | service/ |
| **PublicadorEventos** | Publicación de eventos en RabbitMQ | service/ |
| **MapeadorEmergencias** | Entity ↔ Response DTO | service/ |
| **GeometriaMapper** | CoordenadaDto ↔ JTS geometries | service/ |
| **RepositorioEmergencias** | Queries sobre tabla emergencias (JPA) | repository/ |
| **RepositorioAnuncios** | Queries sobre tabla anuncios (JPA) | repository/ |
| **Emergencia** | Entity JPA, mapeo de tabla emergencias | entity/ |
| **Anuncio** | Entity JPA, mapeo de tabla anuncios | entity/ |
| **TipoEmergencia** | Enum de dominio | entity/ |
| **SeveridadEmergencia** | Enum de dominio | entity/ |
| **EstadoEmergencia** | Enum + máquina de estados | entity/ |
| **SeveridadAnuncio** | Enum de dominio | entity/ |
| **AlcanceAnuncio** | Enum de dominio | entity/ |
| **DeclararEmergenciaRequest** | DTO de entrada (record) | dto/request/ |
| **CambiarEstadoEmergenciaRequest** | DTO de entrada (record) | dto/request/ |
| **PublicarAnuncioRequest** | DTO de entrada (record) | dto/request/ |
| **EmergenciaResponse** | DTO de salida (record) | dto/response/ |
| **AnuncioResponse** | DTO de salida (record) | dto/response/ |
| **CoordenadaDto** | Coordenada (lng, lat) para geometrías | dto/ |
| **GeoJsonPuntoDto** | Representación GeoJSON Point | dto/ |
| **GeoJsonPoligonoDto** | Representación GeoJSON Polygon | dto/ |
| **EmergenciaCreadaEvento** | Evento de dominio publicado en RabbitMQ | event/ |
| **EstadoEmergenciaCambiadoEvento** | Evento de dominio publicado en RabbitMQ | event/ |
| **AnuncioPublicadoEvento** | Evento de dominio publicado en RabbitMQ | event/ |
| **EventoDominio** | Interfaz base para eventos | event/ |
| **EmergenciaNoEncontradaException** | Excepción 404 | exception/ |
| **EmergenciaNoActivaException** | Excepción 409 | exception/ |
| **TransicionEstadoInvalidaException** | Excepción 409 | exception/ |
| **GeometriaInvalidaException** | Excepción 400 | exception/ |
| **ManejadorGlobalExcepciones** | @ControllerAdvice para manejo centralizado | exception/ |
| **FiltroAutenticacionFirebase** | Filter: verifica JWT tokens Firebase | seguridad/ |
| **FiltroAutenticacionDev** | Filter: modo dev con headers | seguridad/ |
| **ProveedorPermisos** | Resuelve permisos por rol (RBAC) | seguridad/ |
| **ContextoUsuario** | Extrae usuarioId del contexto autenticado | seguridad/ |
| **UsuarioAutenticado** | Principal autenticado | seguridad/ |
| **RabbitMQConfig** | Declara exchanges, queues, converters | config/ |
| **SeguridadConfig** | SecurityFilterChain, CORS, @EnableMethodSecurity | config/ |
| **FirebaseConfig** | Inicializa Firebase Admin SDK | config/ |
| **RedisConfig** | Configuración de Redis cache | config/ |
| **OpenApiConfig** | Configuración de OpenAPI/Swagger | config/ |

---

## DEPENDENCIAS INYECTADAS

### ServicioEmergencias

```
ServicioEmergencias {
    RepositorioEmergencias repositorioEmergencias
    GeometriaMapper geometriaMapper
    MapeadorEmergencias mapeadorEmergencias
    PublicadorEventos publicadorEventos
    ContextoUsuario contextoUsuario
    ObjectMapper objectMapper  // Jackson
}
```

### ServicioAnuncios

```
ServicioAnuncios {
    RepositorioAnuncios repositorioAnuncios
    RepositorioEmergencias repositorioEmergencias
    PublicadorEventos publicadorEventos
    ContextoUsuario contextoUsuario
}
```

### ControladorEmergencias

```
ControladorEmergencias {
    ServicioEmergencias servicioEmergencias
}
```

### ControladorAnuncios

```
ControladorAnuncios {
    ServicioAnuncios servicioAnuncios
}
```

---

## FLUJO DE SEGURIDAD

```
Request HTTP
    ↓
SeguridadConfig.securityFilterChain()
    ├─ if firebaseEnabled:
    │   └─ FiltroAutenticacionFirebase
    │       ├─ Extrae Authorization header
    │       ├─ Verifica JWT con FirebaseAuth
    │       ├─ Extrae custom claims (roles)
    │       ├─ ProveedorPermisos.permisosPara(roles)
    │       └─ Crea GrantedAuthority[] para Spring Security
    │
    ├─ else if devMode:
    │   └─ FiltroAutenticacionDev
    │       ├─ Extrae X-Dev-User-Id, X-Dev-Roles headers
    │       └─ Crea GrantedAuthority[] para testing
    │
    └─ Evaluación de @PreAuthorize
        ├─ Checkea hasAuthority('PERMISO')
        ├─ Si tiene permiso → OK
        └─ Si no → 403 Forbidden
    ↓
Controller
```

---

## CICLO DE VIDA DE ENTIDADES

### Emergencia

```
NEW (transient)
    ↓
@PrePersist
    ├─ id = UUID.randomUUID() (si null)
    ├─ estado = ACTIVA (si null)
    ├─ declaradaEn = OffsetDateTime.now()
    └─ actualizadaEn = OffsetDateTime.now()
    ↓
MANAGED (persistida)
    ↓
cambiarEstado() llamado
    ├─ estado actualizado
    └─ @PreUpdate en flush
        └─ actualizadaEn = OffsetDateTime.now()
    ↓
MANAGED (actualizada)
    ↓
delete() (si se llama)
    └─ REMOVED
```

---

## ÍNDICES DE BASE DE DATOS

```sql
-- Emergencias
CREATE INDEX idx_emergencias_estado ON emergencias(estado);
CREATE INDEX idx_emergencias_tipo ON emergencias(tipo);
CREATE INDEX idx_emergencias_zona_impacto ON emergencias USING GIST(zona_impacto);
CREATE INDEX idx_emergencias_epicentro ON emergencias USING GIST(coordenadas_epicentro);

-- Anuncios
CREATE INDEX idx_anuncios_emergencia_id ON anuncios(emergencia_id);
CREATE INDEX idx_anuncios_vigencia ON anuncios(vigente_desde, vigente_hasta);
CREATE INDEX idx_anuncios_severidad ON anuncios(severidad);
```

---

## CONFIGURACIÓN DE BEANS SPRING

```java
// RabbitMQConfig
@Bean TopicExchange catastrofesclEventsExchange()
@Bean DirectExchange catastrofesclDlxExchange()
@Bean MessageConverter messageConverter()  // Jackson2JsonMessageConverter
@Bean RabbitTemplate rabbitTemplate()

// SeguridadConfig
@Bean SecurityFilterChain securityFilterChain()
@Bean CorsConfigurationSource corsConfigurationSource()

// FirebaseConfig (if enabled=true)
@Bean FirebaseAuth firebaseAuth()

// RedisConfig
@Bean LettuceConnectionFactory()
@Bean RedisTemplate<String, String>()

// OpenApiConfig
@Bean OpenAPI openAPI()
```

---

## VALIDACIONES EN CASCADA

### DeclararEmergenciaRequest

```
@Valid DeclararEmergenciaRequest
    ├─ tipo: @NotNull
    ├─ severidad: @NotNull
    ├─ region: @NotBlank @Size(max=100)
    ├─ epicentro: @Valid
    │   ├─ longitud: @NotNull @DecimalMin(-180) @DecimalMax(180)
    │   └─ latitud: @NotNull @DecimalMin(-90) @DecimalMax(90)
    └─ zonaImpacto: @Valid @Size(min=4)
        └─ cada CoordenadaDto: @Valid (idem epicentro)
```

### Validaciones Adicionales (en Service)

```
GeometriaMapper.aPoligono(List<CoordenadaDto>)
    ├─ Valida primer punto = último punto (anillo cerrado)
    ├─ Si no → GeometriaInvalidaException
    └─ Si sí → retorna Polygon JTS
```

---

## TRANSACCIONES

```
@Transactional
public EmergenciaResponse declarar()
    ├─ READ: contextoUsuario.usuarioIdActual()
    ├─ CREATE: repositorioEmergencias.save()
    ├─ PUBLISH: publicadorEventos.publicar()
    └─ READ: mapeadorEmergencias.aResponse()

@Transactional
public EmergenciaResponse cambiarEstado()
    ├─ READ: repositorioEmergencias.findById()
    ├─ UPDATE: repositorioEmergencias.save()
    ├─ PUBLISH: publicadorEventos.publicar()
    └─ READ: mapeadorEmergencias.aResponse()

@Transactional(readOnly=true)
public List<EmergenciaResponse> listarActivas()
    └─ READ: repositorioEmergencias.findByEstado()

@Transactional(readOnly=true)
public Page<AnuncioResponse> listarVigentes()
    └─ READ: repositorioAnuncios.listarVigentes()
```

---

## INTEGRACIÓN CON OTROS MICROSERVICIOS

### RabbitMQ Event Bindings

| Evento | Routing Key | Publicador | Consumidores Esperados |
|--------|------------|-----------|----------------------|
| `EmergenciaCreadaEvento` | `emergency.created` | ms-emergencies | ms-resources, ms-logistics, ms-notifications |
| `EstadoEmergenciaCambiadoEvento` | `emergency.status.changed` | ms-emergencies | ms-resources, ms-logistics, ms-notifications |
| `AnuncioPublicadoEvento` | `announcement.published` | ms-emergencies | ms-notifications |

---

## TESTING (Suites Disponibles)

| Test Class | Ubicación | Responsabilidad |
|---|---|---|
| `ServicioEmergenciasTest` | src/test/ | Unit tests de lógica de negocio |
| `ServicioAnunciosTest` | src/test/ | Unit tests de publicación |
| `GeometriaMapperTest` | src/test/ | Unit tests de conversiones geométricas |
| `ProveedorPermisosTest` | src/test/ | Unit tests de RBAC |
| `EmergenciasIntegracionTest` | src/test/ | Integration tests (TestContainers) |
| `BaseIntegracionTest` | src/test/ | Base class para tests de integración |

---

## ROADMAP FUTURO

- [ ] Consumir eventos de ms-identity (user.role.changed) para sincronizar permisos
- [ ] Implementar Dead Letter Queue (DLQ) para eventos fallidos
- [ ] Agregar endpoint geoespacial: `GET /emergencies/active?bbox=...`
- [ ] Versioning de API (v1, v2)
- [ ] Audit trail de cambios
- [ ] WebSocket para notificaciones en tiempo real
- [ ] Integración con SMS/Push notifications
- [ ] Dashboard de alertas en tiempo real

