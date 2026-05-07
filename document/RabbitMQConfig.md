# Configuración RabbitMQ — Fase 7

> Configuración estándar para Topic Exchange, DLQ e idempotencia
> Aplicable a todos los microservicios del sistema CatástrofesCL

---

## 🏗️ Arquitectura RabbitMQ

### Exchanges

```yaml
# Topic Exchange principal
catastrofescl.events:
  type: topic
  durable: true
  auto_delete: false

# Dead Letter Exchange
catastrofescl.dlx:
  type: direct
  durable: true
  auto_delete: false
```

### Routing Keys Definidas

```yaml
# Eventos de stock e inventario
stock.critical
stock.updated
inventory.movement.registered

# Eventos de donaciones y necesidades
donation.created
donation.confirmed
need.created

# Eventos de logística
transfer.created
transfer.status.changed
mission.assigned

# Eventos de emergencias
emergency.created
emergency.status.changed

# Eventos de anuncios
announcement.published
```

### Colas Principales y DLQs

```yaml
# Colas principales (bound al topic exchange)
stock.critical.queue
stock.updated.queue
inventory.movement.registered.queue
donation.created.queue
donation.confirmed.queue
need.created.queue
transfer.created.queue
transfer.status.changed.queue
mission.assigned.queue
emergency.created.queue
emergency.status.changed.queue
announcement.published.queue

# Dead Letter Queues (bound al DLX exchange)
stock.critical.dlq
stock.updated.dlq
inventory.movement.registered.dlq
donation.created.dlq
donation.confirmed.dlq
need.created.dlq
transfer.created.dlq
transfer.status.changed.dlq
mission.assigned.dlq
emergency.created.dlq
emergency.status.changed.dlq
announcement.published.dlq
```

### Políticas de Reintento

```yaml
# Para todas las colas principales
x-max-retries: 3
x-message-ttl: 30000  # 30 segundos en milisegundos
x-dead-letter-exchange: catastrofescl.dlx
x-dead-letter-routing-key: stock.critical.dlq  # routing key específica por cola
```

---

## 🔧️ Configuración Spring AMQP

### application.yml

```yaml
spring:
  rabbitmq:
    host: ${RABBITMQ_HOST:localhost}
    port: ${RABBITMQ_PORT:5672}
    username: ${RABBITMQ_USERNAME:guest}
    password: ${RABBITMQ_PASSWORD:guest}
    virtual-host: ${RABBITMQ_VHOST:/}
    
    # Publisher confirms
    publisher-confirm-type: correlated
    publisher-returns: true
    
    # Template settings
    template:
      retry:
        enabled: true
        initial-interval: 1000ms
        max-attempts: 3
        max-interval: 10000ms
        
    # Listener settings
    listener:
      simple:
        default-requeue-rejected: false
        acknowledge-mode: manual
        retry:
          enabled: true
```

### Configuración Java

```java
@Configuration
@EnableRabbitMQ
public class RabbitMQConfig {

    @Value("${spring.rabbitmq.host}")
    private String host;

    @Value("${spring.rabbitmq.port}")
    private int port;

    @Value("${spring.rabbitmq.username}")
    private String username;

    @Value("${spring.rabbitmq.password}")
    private String password;

    @Bean
    public ConnectionFactory connectionFactory() {
        CachingConnectionFactory factory = new CachingConnectionFactory();
        factory.setHost(host);
        factory.setPort(port);
        factory.setUsername(username);
        factory.setPassword(password);
        factory.setVirtualHost("/");
        
        // Publisher confirms
        factory.setPublisherConfirmType(CachingConnectionFactory.ConfirmType.CORRELATED);
        factory.setPublisherReturns(true);
        
        return factory;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(new Jackson2JsonMessageConverter());
        template.setMandatory(true);  // For DLQ routing
        return template;
    }

    @Bean
    public TopicExchange catastrofesclEvents() {
        return new TopicExchange("catastrofescl.events", true, false);
    }

    @Bean
    public DirectExchange catastrofesclDLX() {
        return new DirectExchange("catastrofescl.dlx", true, false);
    }

    // Colas principales con DLQ binding
    @Bean
    public Queue stockCriticalQueue() {
        return QueueBuilder
            .durable("stock.critical.queue")
            .withArgument("x-dead-letter-exchange", "catastrofescl.dlx")
            .withArgument("x-dead-letter-routing-key", "stock.critical.dlq")
            .withArgument("x-max-retries", 3)
            .withArgument("x-message-ttl", 30000)
            .build();
    }

    @Bean
    public Binding stockCriticalBinding() {
        return BindingBuilder
            .bind(stockCriticalQueue())
            .to(catastrofesclEvents())
            .with("stock.critical")
            .build();
    }

    // Dead Letter Queues
    @Bean
    public Queue stockCriticalDLQ() {
        return QueueBuilder
            .durable("stock.critical.dlq")
            .build();
    }

    @Bean
    public Binding stockCriticalDLQBinding() {
        return BindingBuilder
            .bind(stockCriticalDLQ())
            .to(catastrofesclDLX())
            .with("stock.critical.dlq")
            .build();
    }

    // Repetir patrón para otras colas...
}
```

---

## 🔄️ Idempotencia

### Implementación en Redis

```java
@Service
public class IdempotenciaService {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    private static final String PROCESSED_KEY_PREFIX = "processed:";
    private static final Duration TTL_24H = Duration.ofHours(24);

    public boolean yaProcesado(String eventId) {
        String key = PROCESSED_KEY_PREFIX + eventId;
        Boolean existe = redisTemplate.hasKey(key);
        return existe != null && existe;
    }

    public void marcarComoProcesado(String eventId) {
        String key = PROCESSED_KEY_PREFIX + eventId;
        redisTemplate.opsForValue().set(key, "true", TTL_24H);
    }

    public void limpiarProcesadosAntiguos(Duration antiguedad) {
        Set<String> keys = redisTemplate.keys(PROCESSED_KEY_PREFIX + "*");
        keys.stream()
            .filter(key -> {
                String timestamp = redisTemplate.opsForValue().get(key);
                if (timestamp != null) {
                    Instant tiempoProcesado = Instant.parse(timestamp);
                    return Instant.now().minus(antiguedad).isAfter(tiempoProcesado);
                }
                return false;
            })
            .forEach(redisTemplate::delete);
    }
}
```

### Implementación en Consumidor

```java
@RabbitListener(queues = "stock.critical.queue")
public class StockCriticalConsumer {

    @Autowired
    private IdempotenciaService idempotenciaService;

    @Autowired
    private StockCriticalEventProcessor eventProcessor;

    @RabbitHandler
    public void handleStockCritical(@Payload StockCriticalEvent event, 
                                   Message message,
                                   Channel channel) throws IOException {
        
        String eventId = event.getId();
        
        // 1. Verificar idempotencia
        if (idempotenciaService.yaProcesado(eventId)) {
            log.info("Evento {} ya fue procesado, ignorando", eventId);
            channel.basicAck(message.getMessageProperties().getDeliveryTag());
            return;
        }

        try {
            // 2. Procesar evento
            eventProcessor.procesar(event);
            
            // 3. Marcar como procesado
            idempotenciaService.marcarComoProcesado(eventId);
            
            // 4. Confirmar recepción
            channel.basicAck(message.getMessageProperties().getDeliveryTag());
            
        } catch (Exception e) {
            log.error("Error procesando evento {}: {}", eventId, e);
            
            // 5. Rechazar para reintento (irá a DLQ después de 3 intentos)
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false);
        }
    }
}
```

---

## 🧪️ Testing de Resiliencia

### Pruebas de DLQ

```java
@SpringBootTest
@TestMethodOrder(Ordered.HIGHEST_PRECEDENCE)
public class RabbitMQResilienciaTest {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Test
    public void cuandoConsumerFalla_mensajeVaADLQ() {
        // Simular fallo en consumidor
        // Enviar mensaje que cause excepción
        
        // Verificar que aparece en DLQ
        StockCriticalEvent dlqMessage = rabbitTemplate.receiveAndConvert("stock.critical.dlq");
        assertThat(dlqMessage).isNotNull();
        assertThat(dlqMessage.getId()).isEqualTo(eventId);
    }

    @Test
    public void cuandoConsumerCaida_mensajesSeRetienen() {
        // Bajar consumidor
        // Enviar mensajes
        // Verificar que se acumulan en colas
        // Levantar consumidor
        // Verificar que procesa mensajes pendientes
    }
}
```

---

## 📊️ Monitoreo y Alertas

### Métricas Importantes

```java
@Component
public class RabbitMQMetrics {

    private final MeterRegistry meterRegistry;
    private final Counter messagesProcessed;
    private final Counter messagesFailed;
    private final Counter dlqMessages;
    private final Gauge queueSize;

    public RabbitMQMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.messagesProcessed = Counter.builder("rabbitmq.messages.processed")
                .description("Mensajes procesados exitosamente")
                .register(meterRegistry);
        this.messagesFailed = Counter.builder("rabbitmq.messages.failed")
                .description("Mensajes fallidos")
                .register(meterRegistry);
        this.dlqMessages = Counter.builder("rabbitmq.messages.dlq")
                .description("Mensajes en Dead Letter Queue")
                .register(meterRegistry);
    }

    public void incrementProcessed() {
        messagesProcessed.increment();
    }

    public void incrementFailed() {
        messagesFailed.increment();
    }

    public void incrementDLQ() {
        dlqMessages.increment();
    }
}
```

### Alertas DLQ

```java
@Service
public class DLQAlertService {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Scheduled(fixedRate = 60000) // Cada minuto
    public void monitorearDLQ() {
        monitorearCola("stock.critical.dlq");
        monitorearCola("donation.created.dlq");
        monitorearCola("emergency.created.dlq");
        // ... otras colas críticas
    }

    private void monitorearCola(String colaDLQ) {
        Integer mensajesEnDLQ = rabbitTemplate.receiveAndConvert(colaDLQ) != null ? 1 : 0;
        
        if (mensajesEnDLQ > 0) {
            // Enviar alerta a Slack/email/Sentry
            alertarDLQ(colaDLQ, mensajesEnDLQ);
        }
    }

    private void alertarDLQ(String cola, int cantidad) {
        String mensaje = String.format(
            "⚠️ ALERTA DLQ: Hay %d mensajes en %s. Requiere intervención manual.",
            cantidad, cola
        );
        
        // Lógica de envío de alerta
        log.error(mensaje);
        // enviarAlerta(mensaje);
    }
}
```

---

## 🚀️ Buenas Prácticas

### 1. **Siempre verificar idempotencia ANTES de procesar**
```java
// ✅ Correcto
if (idempotenciaService.yaProcesado(eventId)) {
    log.info("Evento {} ya procesado, ignorando", eventId);
    return;
}

// ❌ Incorrecto
procesarEvento(event); // Sin verificación
```

### 2. **Nunca hacer ACK sin procesamiento exitoso**
```java
// ✅ Correcto
try {
    eventProcessor.procesar(event);
    idempotenciaService.marcarComoProcesado(eventId);
    channel.basicAck(deliveryTag);
} catch (Exception e) {
    channel.basicNack(deliveryTag, false);
}

// ❌ Incorrecto
channel.basicAck(deliveryTag); // Sin procesar
```

### 3. **Configurar timeouts apropiados**
```yaml
# Para eventos críticos: 30s
x-message-ttl: 30000

# Para eventos normales: 5min
x-message-ttl: 300000
```

### 4. **Logs estructurados**
```java
// ✅ Correcto
log.info("Evento {} procesado exitosamente. Tipo: {}, Origen: {}", 
    eventId, event.getClass().getSimpleName(), event.getOrigin());

// ❌ Incorrecto
log.error("Error procesando evento {}", eventId);
```

---

## 📋 Checklist de Implementación

### Para cada microservicio:

- [ ] Configurar Topic Exchange `catastrofescl.events`
- [ ] Configurar Dead Letter Exchange `catastrofescl.dlx`
- [ ] Definir colas principales con DLQ binding
- [ ] Implementar servicio de idempotencia con Redis
- [ ] Agregar verificación de idempotencia en todos los consumidores
- [ ] Configurar retry policies (3 intentos, 30s TTL)
- [ ] Implementar pruebas de resiliencia
- [ ] Configurar monitoreo de DLQ
- [ ] Agregar métricas de RabbitMQ
- [ ] Documentar eventos publicados

### Validación:

- [ ] Mensajes se publican al Topic Exchange
- [ ] Consumidores verifican idempotencia
- [ ] Mensajes fallidos van a DLQ después de 3 reintentos
- [ ] DLQ genera alertas automáticas
- [ ] Pruebas de resiliencia pasan
- [ ] Métricas están disponibles en `/actuator/metrics`
