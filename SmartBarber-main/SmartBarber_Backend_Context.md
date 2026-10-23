# SmartBarber — Contexto técnico del Backend

> **Propósito de este documento:** servir como contexto técnico para una IA que necesite comprender, analizar, modificar o integrar el backend de SmartBarber sin tener que interpretar nuevamente toda la estructura del proyecto.  
> **Fuente:** análisis del código fuente incluido en `SmartBarber.zip`.  
> **Criterio:** se describen estructuras, rutas, DTOs, modelos, dependencias y reglas observadas directamente en el código. No se agregan funcionalidades que no estén presentes.

---

## 1. Identidad y propósito del proyecto

**SmartBarber** es un backend reactivo para la gestión de una plataforma de barberías. El sistema contempla:

- usuarios y autenticación mediante Firebase;
- roles `ADMIN`, `BARBER` y `CUSTOMER`;
- barberías;
- empleados/barberos;
- clientes;
- servicios ofrecidos por cada barbería;
- horarios de empleados;
- reservas programadas;
- reservas asociadas a múltiples servicios;
- cola virtual de atención;
- notificaciones por correo electrónico;
- reseñas de reservas;
- planes de suscripción;
- suscripciones de una barbería/barbero;
- transacciones y flujo de pago;
- comunicación en tiempo real mediante WebSocket;
- renovación y expiración automática de suscripciones.

El backend está implementado en **Java 21**, con **Spring Boot 4.0.8**, **Spring WebFlux**, **R2DBC** y **PostgreSQL**.

---

# 2. Stack tecnológico

## Lenguaje y runtime

- Java 21.
- Gradle.
- Spring Boot `4.0.8`.

## Frameworks y librerías principales

- `spring-boot-starter-webflux`
- `spring-boot-starter-data-r2dbc`
- `spring-boot-starter-security`
- `spring-boot-starter-validation`
- `spring-boot-starter-mail`
- `r2dbc-pool`
- PostgreSQL + R2DBC PostgreSQL
- Firebase Admin SDK `9.11.0`
- Auth0 Java JWT `4.6.1`
- MapStruct `1.6.3`
- Lombok

## Estilo reactivo

El backend utiliza principalmente:

- `Mono<T>` para operaciones que devuelven cero o un elemento.
- `Flux<T>` para colecciones o streams.
- `TransactionalOperator` para transacciones reactivas.
- WebFlux Functional Routing mediante `RouterFunction`.
- WebSocket reactivo.

---

# 3. Arquitectura general

La estructura sigue principalmente un enfoque **hexagonal / ports and adapters**, separado en:

```text
infrastructure
    ├── entrypoint
    │   ├── reactiveweb
    │   ├── websocket
    │   └── scheduler
    │
    └── drivenadapter
        ├── postgres
        ├── firebase
        ├── email
        └── websocket

application
    ├── command
    ├── mapper
    └── usecase

domain
    ├── enums
    ├── exceptions
    ├── model
    └── port
```

### Flujo conceptual principal

```text
HTTP / WebSocket
      ↓
Entrypoint / Handler
      ↓
DTO / Mapper
      ↓
Application Command / Domain Model
      ↓
Use Case
      ↓
Domain Port
      ↓
Driven Adapter
      ↓
PostgreSQL / Firebase / Email / WebSocket
```

La regla importante para una IA que modifique el backend es:

> **No conectar directamente un Handler con PostgreSQL.** El Handler debe pasar por un Use Case y este debe utilizar un Port. Los adapters implementan los ports.

---

# 4. Paquetes principales

## 4.1 `application`

Contiene la lógica de aplicación.

### `application.command.in`

Representa los comandos que utilizan los casos de uso.

Principales comandos:

- `UserCommand`
- `CustomerCommand`
- `CustomerOnboardingCommand`
- `EmployeeCommand`
- `EmployeeOnboardingCommand`
- `BarbershopCommand`
- `BarberShopOnboardingCommand`
- `ServiceCommand`
- `ScheduleCommand`
- `ReservationCommand`
- `ServiceReservationCommand`
- `ReservationReviewCommand`
- `NotificationCommand`
- `RoleCommand`
- `SubscriptionCommand`
- `SubscriptionBarbershopCommand`
- `SubscriptionTypeBarbershop`
- `TransactionCommand`
- `MessageCommand`

### `application.usecase`

Contiene la lógica de negocio.

Dominios implementados:

```text
authentication
barbershop
customer
employee
notification
queue
reservation
reservationreview
role
schedule
service
subscription
subscriptionbarber
transaction
user
```

---

# 5. Dominio y entidades principales

## 5.1 User

Modelo:

```text
User
- UUID id
- String firebaseId
- UserStatus status
- Instant createAt
- Instant updateAt
- Short roleId
```

Tabla:

```text
usuario
```

Columnas:

```text
user_id
uid_firebase
estado
fecha_creacion
fecha_modificacion
id_rol
```

El usuario está vinculado a Firebase mediante `firebaseId` y a un rol mediante `roleId`.

---

## 5.2 Customer

Modelo:

```text
Customer
- UUID id
- UUID userId
- String document
- DocumentType documentType
- String name
- String cell
- String email
- Instant createAt
- Instant updateAt
```

Tabla:

```text
cliente
```

El cliente puede estar vinculado a un `User`.

---

## 5.3 Employee

Modelo:

```text
Employee
- UUID id
- UUID userId
- UUID barberiaId
- String document
- DocumentType documentType
- String name
- String cell
- String email
- String specialty
- Instant createAt
- Instant updateAt
```

Tabla:

```text
empleado
```

Un empleado pertenece a una barbería mediante `barberiaId`.

---

## 5.4 Barbershop

Modelo:

```text
Barbershop
- UUID id
- String name
- String description
- String location
- String phone
- String document
- DocumentType documentType
- String companyName
- String status
- Instant createAt
- Instant updateAt
```

Tabla:

```text
barberia
```

---

## 5.5 Service

Modelo:

```text
Service
- Integer id
- UUID barberiaId
- String name
- String description
- Integer duration
- Boolean status
- Boolean offer
- Integer price
- Integer specialPrice
- Instant createAt
- Instant updateAt
```

Tabla:

```text
servicio
```

Un servicio pertenece a una barbería y posee una duración en minutos.

---

## 5.6 Schedule

Modelo:

```text
Schedule
- Integer id
- UUID empleadoId
- LocalTime startTime
- LocalTime endTime
- LocalTime lunchStartTime
- LocalTime lunchEndTime
- Boolean vacation
```

Tabla:

```text
horario_empleado
```

---

## 5.7 Reservation

Modelo:

```text
Reservation
- UUID id
- UUID barbershopId
- UUID customerId
- UUID employeeId
- ReservationType reservationType
- ReservationStatus status
- Integer duration
- Instant startTime
- Instant endTime
- String notes
- Instant creationDate
- Instant updatedDate
- Instant queueEntryTime
```

Tabla:

```text
reserva
```

Columnas relevantes:

```text
id_reserva
id_cliente
id_empleado
id_barberia
tipo_reserva
estado
duracion
fecha_ingreso_cola
fecha_inicio_real
fecha_fin_real
motivo_cancelacion
fecha_creacion
fecha_modificacion
```

Una reserva puede ser:

- `VIRTUAL_QUEUE`
- `SERVICE_RESERVATION`

---

# 6. Estados y enums

## DocumentType

```text
CC
CE
NIT
```

## UserStatus

```text
ACTIVE
BLOCKED
PENDING
```

## RoleType

```text
ADMIN   -> id 1
BARBER  -> id 2
CUSTOMER -> id 3
```

## ReservationType

```text
VIRTUAL_QUEUE
SERVICE_RESERVATION
```

## ReservationStatus

```text
PENDING
CONFIRMED
IN_PROGRESS
COMPLETED
CANCELLED
WAITING
NO_SHOW
```

## ServiceReservationStatus

```text
COMPLETED
ACTIVE
CANCEL
```

## TransactionStatus

```text
PENDING
APPROVED
REJECTED
CANCELED
REFUNDED
```

## TransactionType

```text
BOOKING_TRANSACTION
SUBSCRIPTION_TRANSACTION
```

## SubscriptionType

```text
CREATE
RENEW
EXPIRED
```

## SubscriptionBarberStatus

```text
ACTIVE
APPROVED
PENDING
DECLINED
EXPIRED
```

Mapeo importante:

```text
TransactionStatus.PENDING
    -> SubscriptionBarberStatus.PENDING

TransactionStatus.APPROVED
    -> SubscriptionBarberStatus.ACTIVE

TransactionStatus.REJECTED
TransactionStatus.REFUNDED
TransactionStatus.CANCELED
    -> SubscriptionBarberStatus.DECLINED
```

---

# 7. Reservas

## Reserva programada

El flujo principal está en:

```text
CreateReservationUc
```

Proceso:

```text
ReservationCommand
    ↓
cargar servicios
    ↓
sumar duración de servicios
    ↓
calcular endTime = startTime + duración
    ↓
validar disponibilidad del empleado
    ↓
validar que el cliente no tenga otra reserva
    ↓
crear Reservation
    ↓
guardar Reservation
    ↓
crear ServiceReservation por cada servicio
    ↓
crear Notification
    ↓
enviar correo
    ↓
actualizar notificación como SENT o FAILED
```

### Validaciones

Se comprueba:

1. El servicio debe existir.
2. El empleado no debe tener otra reserva en el rango.
3. El cliente no debe tener otra reserva en el mismo rango.

La duración de una reserva se calcula sumando las duraciones de todos sus servicios.

---

# 8. Reservas y servicios asociados

Una reserva puede tener varios servicios.

Tabla intermedia:

```text
reserva_servicio
```

Modelo:

```text
ServiceReservation
- UUID id
- UUID reservationId
- Integer serviceId
- ServiceReservationStatus status
- Integer duration
- Instant createdAt
- Instant updatedAt
```

Por cada servicio enviado en `reservationServiceId`, el backend crea una entidad `ServiceReservation`.

---

# 9. Confirmación y cancelación de reservas

Use Case:

```text
ChangeReservationStatusUc
```

### Confirmar

```text
PENDING → CONFIRMED
```

Además:

- busca al cliente;
- genera notificación;
- genera contenido del correo;
- registra la notificación;
- envía el correo;
- marca notificación como `SENT`.

Evento:

```text
RESERVATION_CONFIRMED
```

### Cancelar

Genera:

```text
RESERVATION_CANCELLED
```

y actualiza la reserva mediante el método de dominio correspondiente.

---

# 10. Cola virtual

La cola virtual es uno de los módulos principales del backend.

Rutas:

```text
POST /api/v1/queue/{employeeId}/open
POST /api/v1/queue/{employeeId}/close
POST /api/v1/queue/{employeeId}/next
POST /api/v1/queue/{employeeId}/complete
POST /api/v1/queue/join
GET  /api/v1/queue/{employeeId}
```

## Modelo BarberQueue

Tabla:

```text
cola_barbero
```

Modelo:

```text
BarberQueue
- UUID id
- UUID employeeId
- UUID barbershopId
- Boolean acceptingClients
- Long version
- Instant creationDate
- Instant updatedDate
```

---

# 11. Abrir cola

Use Case:

```text
OpenQueueUC
```

Proceso:

```text
employeeId
    ↓
buscar empleado
    ↓
crear/verificar cola
    ↓
bloquear cola para actualización
    ↓
acceptingClients = true
    ↓
publicar evento QUEUE_OPENED
```

La operación utiliza una transacción reactiva.

---

# 12. Cerrar cola

Use Case:

```text
CloseQueueUC
```

Proceso:

```text
buscar y bloquear cola
    ↓
acceptingClients = false
    ↓
publicar QUEUE_CLOSED
```

Cerrar la cola significa que no acepta nuevos clientes; no necesariamente elimina los clientes que ya están esperando.

---

# 13. Unirse a la cola

Endpoint:

```text
POST /api/v1/queue/join
```

Body:

```text
ReservationCommand
```

Campos relevantes:

```text
customerId
employeeId
barbershopId
reservationServiceId
notes
```

Proceso:

```text
validar command
    ↓
buscar cola del empleado
    ↓
validar que acceptingClients == true
    ↓
validar que el empleado pertenece a la barbería
    ↓
buscar todos los servicios
    ↓
validar que los servicios:
    - existen
    - están activos
    - pertenecen a la barbería
    - tienen duración > 0
    ↓
sumar duración
    ↓
crear Reservation tipo cola
    ↓
crear ServiceReservation
    ↓
publicar QUEUE_UPDATED
```

La respuesta se crea con HTTP `201`.

---

# 14. Siguiente cliente

Endpoint:

```text
POST /api/v1/queue/{employeeId}/next
```

Use Case:

```text
NextCustomerUC
```

Reglas:

1. La cola debe existir.
2. El barbero no puede tener otro turno actualmente en atención.
3. Debe existir un cliente esperando.
4. Se toma el siguiente turno.
5. La reserva pasa a atención mediante `iniciarAtencionDesdeCola()`.
6. Se publica `QUEUE_UPDATED`.

---

# 15. Completar turno

Endpoint:

```text
POST /api/v1/queue/{employeeId}/complete
```

Use Case:

```text
CompleteCurrentTurnUC
```

Reglas:

1. La cola debe existir.
2. Debe existir un turno actualmente en atención.
3. La reserva se actualiza mediante `Reservation.completar()`.
4. Se publica `QUEUE_UPDATED`.

---

# 16. Estado de la cola

Endpoint:

```text
GET /api/v1/queue/{employeeId}
```

Devuelve un `QueueSnapshot`.

Estructura conceptual:

```text
QueueSnapshot
- employeeId
- acceptingClients
- currentTurn
- waitingTurns
- updatedAt
```

Cada turno contiene:

```text
QueueTurn
- reservationId
- customerId
- position
- estimatedWaitMinutes
- durationMinutes
- status
```

La espera estimada se calcula acumulando:

```text
tiempo restante del turno actual
+
duración de los turnos anteriores
```

El backend calcula el tiempo restante del turno actual a partir de:

```text
duration - minutos transcurridos desde startTime
```

---

# 17. WebSocket de cola virtual

Endpoint WebSocket:

```text
/ws/virtual-queue
```

El cliente debe enviar:

```text
?employeeId={UUID}
```

Ejemplo conceptual:

```text
/ws/virtual-queue?employeeId=UUID
```

Flujo:

```text
conexión
    ↓
extraer employeeId
    ↓
obtener snapshot inicial
    ↓
enviar QUEUE_SNAPSHOT
    ↓
suscribirse a eventos de la cola
    ↓
recibir QUEUE_OPENED / QUEUE_CLOSED / QUEUE_UPDATED
```

El backend utiliza:

```text
QueueBroadcastService
UserEventPublisherPort
SubscribeQueueUC
VirtualQueueWsHandler
```

---

# 18. Disponibilidad de la cola

Existe:

```text
QueueAvailabilityService
```

Su responsabilidad es comprobar si un nuevo servicio puede ser atendido antes de la siguiente reserva programada.

Calcula:

```text
duración pendiente de cola
+
duración del nuevo servicio
```

y determina el tiempo estimado de finalización.

Si la finalización no ocurre antes de la siguiente reserva programada, rechaza la operación.

---

# 19. Suscripciones

Existe una diferencia entre:

```text
Subscription
```

y

```text
SubscriptionBarbershop
```

## Subscription

Representa el plan.

Tabla:

```text
suscripcion
```

Campos:

```text
id
name
description
price
discount
createAt
updateAt
```

## SubscriptionBarbershop

Representa la suscripción contratada por un barbero/barbería.

Tabla:

```text
suscripcion_barberia
```

Campos:

```text
id
barberId
subscriptionId
status
duration
subscriptionPrice
subscriptionDiscount
automaticRenew
createdAt
updatedAt
startDate
expirationDate
```

---

# 20. Crear suscripción para barbería

Endpoint:

```text
POST /subscription-barbershop-service/create
```

Body:

```text
SubscriptionBarbershopRqDto
```

Campos:

```text
barberId
subscriptionId
status
duration
type
automaticRenew
```

El `type` esperado para creación es:

```text
CREATE
```

Proceso:

```text
buscar plan
    ↓
verificar que el barbero no tenga suscripción activa o pendiente
    ↓
crear SubscriptionBarbershop
    ↓
crear Transaction
    ↓
enviar mensaje de pago
```

---

# 21. Renovación

Endpoint:

```text
PUT /subscription-barbershop-service/renew
```

Tipo:

```text
RENEW
```

El sistema verifica que no exista una suscripción activa o pendiente incompatible, crea una nueva suscripción y genera la transacción correspondiente.

---

# 22. Transacciones y pagos

Tabla:

```text
transaccion
```

Modelo:

```text
Transaction
- UUID transactionId
- UUID reservationId
- UUID subscriptionBarberId
- BigInteger amount
- BigInteger discount
- BigInteger subtotal
- TransactionStatus status
- UUID orderId
- Instant createdAt
- Instant updatedAt
```

Para suscripciones:

```text
currency = COP
description = "Transaction for subscription: " + subscriptionId
```

Se utiliza:

```text
orderId
```

como identificador principal para correlacionar el proceso de pago.

---

# 23. Flujo de pago por WebSocket

El flujo está compuesto principalmente por:

```text
CreateTransactionUC
    ↓
MessageNotificationPort
    ↓
ConnectionManager
    ↓
WebSocket Payment Gateway
    ↓
GatewayResponseHandler
    ↓
UpdateTransactionUC
    ↓
UpdateSubscriptionBarberStatusUC
    ↓
ResponseManager
    ↓
WaitMessageResponseUC
```

WebSocket del backend:

```text
/ws/payment
```

El cliente/conexión externa utiliza un `orderId` para correlacionar la operación.

La respuesta de pago actualiza:

```text
TransactionStatus
```

y posteriormente:

```text
SubscriptionBarberStatus
```

---

# 24. Estados de pago y suscripción

Regla central:

```text
PENDING
    → suscripción PENDING

APPROVED
    → suscripción ACTIVE

REJECTED / REFUNDED / CANCELED
    → suscripción DECLINED
```

Existe una regla adicional en `UpdateSubscriptionBarberStatusUC`:

Si ya existe una suscripción activa y se intenta establecer otra como `ACTIVE`, puede transformarse a:

```text
APPROVED
```

para evitar conflictos con la suscripción activa existente.

---

# 25. Renovación automática

Clase:

```text
RenewAutomaticSubscription
```

El proyecto tiene:

```text
@EnableScheduling
```

en `SmartbarberApplication`.

Sin embargo, actualmente los métodos `@Scheduled` aparecen comentados:

```java
//@Scheduled(cron = "0 */3 * * * *")
//@Scheduled(cron = "30 */3 * * * *")
```

Por lo tanto, el código contiene la lógica de renovación/expiración automática, pero las tareas programadas no están activas mientras esas anotaciones permanezcan comentadas.

La renovación busca suscripciones con renovación automática dentro de una ventana temporal y ejecuta:

```text
SubscriptionType.RENEW
```

La expiración ejecuta:

```text
SubscriptionType.EXPIRED
```

---

# 26. Notificaciones

Tabla:

```text
notificacion
```

Modelo:

```text
Notification
- UUID id
- UUID customerId
- UUID reservationId
- String title
- String content
- String channelType
- String eventType
- String status
- Integer retries
- String messageError
- Instant scheduledDate
- Instant dateSent
- Instant createAt
```

Estados usados en el flujo:

```text
PENDING
SENT
FAILED
```

Cuando el envío de correo falla:

```text
retries = retries + 1
messageError = error.getMessage()
status = FAILED
```

El backend utiliza `EmailService` y SMTP de Gmail.

---

# 27. Correo electrónico

Configuración:

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
```

Se requiere:

```text
MAIL_USERNAME
MAIL_PASSWORD
```

El contenido de los correos utiliza:

```text
America/Bogota
Locale es-CO
```

para formatear fechas y horas de reservas.

---

# 28. Autenticación

Firebase es la fuente principal de autenticación.

Componente:

```text
FirebaseAuthAdapter
```

Puerto:

```text
FirebaseAuthPort
```

La autenticación realiza principalmente:

```text
Bearer Firebase ID Token
    ↓
validar token
    ↓
verificar expiración
    ↓
obtener Firebase UID
    ↓
buscar User por firebaseId
    ↓
buscar Role
    ↓
obtener RoleType
```

Roles permitidos:

```text
CUSTOMER
BARBER
ADMIN
```

---

# 29. JWT / Firebase Filter

Clase:

```text
JwtFilter
```

El header esperado es:

```http
Authorization: Bearer <token>
```

El filtro valida el token mediante:

```text
AuthenticationUC.authorization()
```

Luego genera una autoridad:

```text
ROLE_CUSTOMER
ROLE_BARBER
ROLE_ADMIN
```

según el rol encontrado.

---

# 30. Seguridad por rutas

Configuración principal:

```text
SecurityConfig
```

Rutas permitidas sin autenticación por configuración:

```text
/ws/payment/**
/auth/**
/reservation-service/**
/schedule-service/**
/services-service/**
/customer-service/**
/reservation-review-service/**
/notification-service/**
/public/**
```

Cola:

```text
POST /api/v1/queue/join
    → CUSTOMER

POST /api/v1/queue/{employeeId}/open
POST /api/v1/queue/{employeeId}/close
POST /api/v1/queue/{employeeId}/next
POST /api/v1/queue/{employeeId}/complete
    → BARBER

GET /api/v1/queue/**
    → CUSTOMER | BARBER | ADMIN
```

Además:

```text
GET /user-service/**
    → BARBER
```

El resto de rutas requiere autenticación.

---

# 31. Endpoints HTTP completos

> Las constantes de rutas del código no siempre incluyen `/` inicial. En esta sección se muestran las rutas normalizadas con `/` para facilitar su consumo desde frontend.

## Authentication

```http
POST /auth/verify
```

Permite verificar un Firebase ID Token.

---

## Barbershop

```http
POST /public/barber-service/create-barber
POST /public/barber-service/onboarding

GET  /barber-service/name/{name}
GET  /barber-service/find-all
GET  /barber-service/company-name/{companyName}
GET  /barber-service/document/{document}
GET  /barber-service/id/{id}

PUT  /barber-service/update-barber/{id}
```

---

## Customer

```http
POST /public/customer-service/create-customer
POST /public/customer-service/onboarding

GET  /customer-service/name/{name}
GET  /customer-service/document/{document}
GET  /customer-service/id/{id}

PUT  /customer-service/update-customer/{id}
```

---

## Employee

```http
POST /public/employee-service/crear-empleado
POST /public/employee-service/onboarding

GET  /public/employee-service/barbershop/{barberId}

GET  /employee-service/nombre/{nombre}
GET  /employee-service/documento/{documento}
GET  /employee-service/id/{id}

PUT  /employee-service/actualizar-empleado/{id}
```

---

## Services

```http
POST /services-service/crear-servicio

GET  /services-service/name/{name}
GET  /services-service/id/{id}
GET  /services-service/barberia/{barberiaId}

PUT  /services-service/actualizar-service/{id}
```

---

## Reservations

```http
POST /reservation-service/create

GET /reservation-service/{id}
GET /reservation-service/employee/{employeeId}
GET /reservation-service/customer/{customerId}
GET /reservation-service/barber/{barberId}

PATCH /reservation-service/{id}/confirm
PATCH /reservation-service/{id}/cancel
```

---

## Reservation Reviews

```http
POST /reservation-review-service/crear-resena-reserva

GET /reservation-review-service/id/{id}
GET /reservation-review-service/reserva/{reservationId}

PUT /reservation-review-service/actualizar-resena-reserva/{id}
```

---

## Notifications

```http
POST /notification-service/crear-notificacion

GET /notification-service/id/{id}
GET /notification-service/reserva/{reservationId}
GET /notification-service/cliente/{customerId}

PUT /notification-service/actualizar-notificacion/{id}
```

---

## Roles

```http
POST /role-service/create-role

GET /role-service/id/{id}

PUT /role-service/update-role/{id}
```

---

## Users

```http
POST /public/user-service/crear-usuario

GET /user-service/id/{id}

PUT /user-service/actualizar-usuario/{id}
```

---

## Schedules

```http
POST /schedule-service/crear-schedule

GET /schedule-service/id/{id}
GET /schedule-service/empleado/{empleadoId}

PUT /schedule-service/actualizar-schedule/{id}
```

---

## Subscription plans

```http
POST /subscription-service/create-subscription

GET /subscription-service/all
GET /subscription-service/id/{id}
```

---

## Barber subscriptions

```http
POST /subscription-barbershop-service/create

PUT /subscription-barbershop-service/renew
```

---

## Virtual queue

```http
POST /api/v1/queue/{employeeId}/open
POST /api/v1/queue/{employeeId}/close
POST /api/v1/queue/{employeeId}/next
POST /api/v1/queue/{employeeId}/complete
POST /api/v1/queue/join

GET /api/v1/queue/{employeeId}
```

---

# 32. DTOs de entrada principales

## CustomerRqDto

```text
UUID userId
String name
String document
DocumentType documentType
String cell
String email
```

Validaciones:

```text
userId → obligatorio
name → obligatorio
document → obligatorio
documentType → obligatorio
cell → obligatorio, 10 dígitos
email → obligatorio y válido
```

---

## EmployeeRqDto

```text
UUID barberiaId
String name
String document
DocumentType documentType
String cell
String email
String specialty
UUID userId
```

Validaciones principales:

```text
barberiaId → obligatorio
name → obligatorio
document → obligatorio
documentType → obligatorio
cell → 10 dígitos
email → formato email
specialty → obligatorio
userId → obligatorio
```

---

## BarbershopRqDto

```text
String name
String description
String location
String phone
String document
DocumentType documentType
String companyName
```

---

## ServiceRqDto

```text
UUID barberiaId
String name
String description
Integer duration
Integer price
Boolean offert
Integer special_price
```

**Nota:** el DTO utiliza `offert` y `special_price`, mientras el modelo/comando utiliza `offer` y `specialPrice`. El Mapper es responsable de traducir esta diferencia.

---

## ScheduleRqDto

```text
UUID empleadoId
LocalTime startTime
LocalTime endTime
LocalTime lunchStartTime
LocalTime lunchEndTime
Boolean vacation
```

---

## ReservationCommand

```text
UUID id
UUID barbershopId
UUID customerId
UUID employeeId
List<Integer> reservationServiceId
ReservationType reservationType
ReservationStatus status
Instant startTime
Instant endTime
String notes
Instant creationDate
Instant updatedDate
Instant queueEntryTime
```

Para crear una reserva programada, el backend recalcula `endTime` a partir de la duración de los servicios.

---

## ReservationReviewRqDto

```text
UUID reservationId
Integer qualification
String comment
```

`reservationId` es obligatorio.

---

## NotificationRqDto

```text
UUID customerId
UUID reservationId
String title
String content
String channelType
String eventType
String status
Integer retries
String messageError
Instant scheduledDate
Instant dateSent
```

Validaciones:

```text
customerId → obligatorio
reservationId → obligatorio
title → obligatorio
content → obligatorio
channelType → obligatorio
eventType → obligatorio
status → obligatorio
retries → obligatorio y >= 0
```

---

## UserRqDto

```text
Short roleId
```

---

## RoleRqDto

```text
RoleType roleType
```

---

## SubscriptionRqDto

```text
String name
String description
Integer price
Byte discount
```

---

## SubscriptionBarbershopRqDto

```text
UUID barberId
Integer subscriptionId
SubscriptionBarberStatus status
Integer duration
SubscriptionType type
Boolean automaticRenew
```

---

# 33. DTOs de salida

## CustomerRsDto

```text
id
userId
document
documentType
name
cell
email
createAt
updateAt
```

## EmployeeRsDto

```text
id
userId
barberiaId
document
documentType
name
cell
email
specialty
createAt
updateAt
```

## BarbershopRsDto

```text
id
name
description
location
phone
document
documentType
companyName
status
createAt
updateAt
```

## ServiceRsDto

```text
id
barberiaId
name
description
duration
status
offert
price
special_price
createAt
updateAt
```

## SubscriptionRsDto

```text
id
name
description
price
discount
createAt
updateAt
```

## SubscriptionBarbershopRsDto

```text
id
barberId
subscriptionId
status
duration
subscriptionPrice
subscriptionDiscount
orderId
createdAt
updatedAt
startDate
expirationDate
```

---

# 34. Puertos principales

Los ports representan contratos entre el dominio/aplicación y la infraestructura.

Principales:

```text
BarberShopRepositoryPort
CustomerPort
EmployeePort
UserPort
NotificationPort
FirebaseAuthPort
RolePort
SchedulePort
ServicePort
ReservationReviewPort
```

Reservas:

```text
ReservationRepositoryPort
ServiceReservationPort
```

Suscripciones:

```text
SubscriptionRepositoryPort
SubscriptionBarbershopRepositoryPort
```

Transacciones:

```text
TransactionRepositoryPort
```

Cola:

```text
QueuePort
BarberQueuePort
QueueManagementPort
QueueSubscriptionPort
UserEventPublisherPort
```

Eventos:

```text
MessageNotificationPort
MessageResponsePort
```

---

# 35. Adaptadores PostgreSQL

Los adapters implementan los ports y trabajan con R2DBC.

Ubicación:

```text
infrastructure/drivenadapter/postgres
```

Cada dominio suele tener:

```text
adapter
data
entity
mapper
```

Ejemplo:

```text
BarbershopAdapter
BarbershopData
BarbershopEntity
BarbershopAdapterMapper
```

La separación permite:

```text
Domain Model
    ↕
Data
    ↕
Entity
    ↕
PostgreSQL
```

---

# 36. Tablas principales de PostgreSQL

```text
usuario
rol
cliente
empleado
barberia
servicio
horario_empleado
reserva
reserva_servicio
resena_reserva
notificacion
cola_barbero
suscripcion
suscripcion_barberia
transaccion
```

Relaciones conceptuales principales:

```text
rol
  ↓
usuario
  ├── cliente
  └── empleado
        ↓
     barberia

barberia
  ├── empleados
  ├── servicios
  └── cola_barbero

cliente
  ↓
reserva
  ├── reserva_servicio
  ├── notificacion
  └── resena_reserva

barberia / empleado
  ↓
reserva

suscripcion
  ↓
suscripcion_barberia
  ↓
transaccion
```

---

# 37. Configuración

Archivo:

```text
src/main/resources/application.yaml
```

Configuración:

```yaml
spring.application.name: smart_barber
```

Base de datos:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
```

Pool R2DBC:

```text
enabled: true
initial-size: 5
max-size: 20
```

Correo:

```text
MAIL_USERNAME
MAIL_PASSWORD
```

Pago:

```text
PAYMENT_KEY
payment.timeout = 15
```

El timeout de pago utilizado por `ResponseManager` es de:

```text
15 segundos
```

---

# 38. WebFlux y respuestas HTTP

Los handlers utilizan:

```text
ServerResponse.ok()
ServerResponse.created(...)
ServerResponse.accepted(...)
ServerResponse.notFound()
```

Convenciones observadas:

```text
CREATE → 201 Created
GET → 200 OK
UPDATE → 202 Accepted
```

Aunque algunos endpoints de reserva devuelven `200 OK` para creación.

---

# 39. Manejo de errores

Existen excepciones de dominio y técnicas.

Dominio:

```text
domain/exceptions
```

Incluye mensajes para:

```text
authorization
barbershop
customer
employee
notification
reservation
reservationreview
role
schedule
service
subscription
subscriptionbarber
transaction
user
```

Infraestructura HTTP:

```text
TechnicalExceptions
TechnicalMessageExceptions
GlobalHandlerError
```

DTO de error:

```text
ErrorRsDto
- String reason
- String code
- String message
- Instant date
```

---

# 40. Mappers

Los mappers son importantes porque separan:

```text
HTTP DTO
    ↓
Domain / Command
```

y:

```text
Domain
    ↓
HTTP Response DTO
```

Ejemplos:

```text
CustomerEntryMapper
CustomerOnboardingEntryMapper
EmployeeEntryMapper
EmployeeOnboardingMapper
BarbershopEntryMapper
BarberOnboardingEntryMapper
ServiceEntryMapper
ScheduleEntryMapper
UserEntryMapper
NotificationEntryMapper
ReservationReviewEntryMapper
SubscriptionEntryMapper
SubscriptionBarberEntryMapper
RoleEntryMapper
```

También existen mappers específicos de PostgreSQL.

---

# 41. Onboarding

Existen flujos especiales de onboarding para:

```text
Customer
Employee
Barbershop
```

El patrón es:

```text
HTTP request
    ↓
obtener Firebase UID
    ↓
crear User / asociarlo
    ↓
crear entidad de negocio
    ↓
retornar objeto compuesto
```

Ejemplos de estructuras:

```text
CustomerOnboarding
- CustomerCommand customer
- UserCommand user
```

```text
EmployeeOnbording
- EmployeeCommand employee
- UserCommand user
```

```text
BarberShopOnboarding
- BarbershopCommand barbershop
- UserCommand user
- EmployeeCommand employee
```

---

# 42. Autenticación de sesión

`AuthenticationUC.authorizationSession()` determina la información asociada al usuario autenticado.

Para:

```text
CUSTOMER
```

el flujo es:

```text
Firebase token
→ User
→ Customer
→ Authentication
```

Para:

```text
BARBER / ADMIN
```

el flujo busca:

```text
Firebase token
→ User
→ Employee
→ Barbershop
→ Authentication
```

---

# 43. WebSockets disponibles

## Pago

```text
/ws/payment
```

Handler:

```text
SubscriptionBarbershopWsHandler
```

Utiliza:

```text
orderId
```

como parámetro de consulta.

---

## Cola virtual

```text
/ws/virtual-queue
```

Utiliza:

```text
employeeId
```

como parámetro de consulta.

---

# 44. Flujo completo de una reserva programada

```text
Frontend
   │
   │ POST /reservation-service/create
   ↓
ReservationHandler
   │
   ↓
CreateReservationUc
   │
   ├── ServicePort.findById()
   │
   ├── validar disponibilidad empleado
   │
   ├── validar disponibilidad cliente
   │
   ├── Reservation.createReservation()
   │
   ├── ReservationRepositoryPort.save()
   │
   ├── ServiceReservationPort.save()
   │
   ├── NotificationPort.save()
   │
   └── EmailService.sendEmail()
   │
   ↓
Reservation
```

---

# 45. Flujo completo de cola virtual

```text
Cliente
   │
   │ POST /api/v1/queue/join
   ↓
VirtualQueueHandler
   ↓
CreateReservationQueueUc
   ↓
validar cola
   ↓
validar servicios
   ↓
crear Reservation WAITING
   ↓
crear ServiceReservation
   ↓
QUEUE_UPDATED
   ↓
WebSocket /ws/virtual-queue
   ↓
frontend recibe snapshot
```

Cuando el barbero pulsa "siguiente":

```text
BARBER
  ↓
POST /api/v1/queue/{employeeId}/next
  ↓
NextCustomerUC
  ↓
buscar WAITING
  ↓
iniciarAtencionDesdeCola()
  ↓
QUEUE_UPDATED
```

Cuando termina:

```text
POST /api/v1/queue/{employeeId}/complete
  ↓
CompleteCurrentTurnUC
  ↓
Reservation.completar()
  ↓
QUEUE_UPDATED
```

---

# 46. Flujo completo de suscripción

```text
Frontend
   │
   │ POST /subscription-barbershop-service/create
   ↓
SubscriptionBarbershopHandler
   ↓
ExecuteSubscriptionBarberUC
   ↓
FindSubscriptionUC
   ↓
CreateSubscriptionBarberUC
   ↓
SubscriptionBarbershopRepositoryPort.save()
   ↓
CreateTransactionUC
   ↓
TransactionRepositoryPort.save()
   ↓
ConnectionManager
   ↓
WebSocket Payment Gateway
```

Respuesta posterior:

```text
Gateway
   ↓
ConnectionManager
   ↓
GatewayResponseHandler
   ↓
UpdateTransactionUC
   ↓
UpdateSubscriptionBarberStatusUC
   ↓
ResponseManager
   ↓
WaitMessageResponseUC
   ↓
SubscriptionBarbershopWsHandler
```

---

# 47. Reglas que una IA debe respetar al modificar el backend

Cuando se solicite modificar o extender este backend, la IA debe considerar:

1. **Mantener Java 21.**
2. **Mantener programación reactiva** usando `Mono` y `Flux`.
3. No introducir JDBC/JPA si no se solicita explícitamente.
4. Mantener R2DBC para PostgreSQL.
5. Respetar la arquitectura de ports/adapters.
6. Los handlers deben permanecer enfocados en HTTP.
7. La lógica de negocio debe ubicarse en Use Cases o en el dominio.
8. Los ports deben representar las dependencias externas.
9. Los adapters deben implementar los ports.
10. Utilizar los DTOs para la frontera HTTP.
11. Usar mappers para transformar DTO ↔ dominio.
12. Mantener las transacciones mediante `TransactionalOperator` cuando la operación lo requiera.
13. Mantener Firebase como mecanismo de autenticación existente.
14. No cambiar nombres de campos existentes sin considerar los mappers y entidades.
15. Mantener las relaciones entre:
    - User ↔ Role
    - User ↔ Customer
    - User ↔ Employee
    - Employee ↔ Barbershop
    - Service ↔ Barbershop
    - Reservation ↔ Customer
    - Reservation ↔ Employee
    - Reservation ↔ Barbershop
    - Reservation ↔ ServiceReservation
    - SubscriptionBarbershop ↔ Subscription
    - Transaction ↔ SubscriptionBarbershop
16. Para funcionalidades de tiempo real, utilizar los mecanismos WebSocket ya existentes.
17. Para eventos de cola, utilizar `QueueBroadcastService`.
18. Para operaciones de pago, respetar `orderId` como identificador de correlación.
19. Para autenticación, respetar `FirebaseAuthPort` y `AuthenticationUC`.
20. Antes de crear una nueva entidad, servicio o endpoint, verificar si ya existe un modelo, port, adapter, use case, DTO y mapper equivalente.

---

# 48. Convenciones importantes detectadas

El proyecto mezcla nombres en español e inglés. Algunos ejemplos:

```text
barberiaId
empleadoId
documento
nombre
cell
email
```

junto con:

```text
customerId
employeeId
barbershopId
startTime
endTime
createdAt
updatedAt
```

También existen algunos nombres históricos/inconsistentes:

```text
athentication
suscription
onbording
EmployeeRuta
CustomerRout
ReservationRuta
```

No deben corregirse automáticamente porque pueden formar parte de imports y referencias internas.

---

# 49. Diferencias de nombres que deben tenerse en cuenta

## Service

DTO:

```text
offert
special_price
```

Modelo:

```text
offer
specialPrice
```

## Barbershop / Employee

Hay mezcla entre:

```text
barberia
barbershop
barber
employee
empleado
```

El contexto debe interpretar estos términos según la capa:

- `barberiaId` / `barbershopId` → identificador de la barbería.
- `employeeId` / `empleadoId` → identificador del empleado/barbero.
- `barberId` → en algunos flujos se utiliza para identificar al propietario/barbero asociado a una suscripción.

---

# 50. Resumen de módulos

| Módulo | Responsabilidad |
|---|---|
| Authentication | Firebase, token, rol |
| User | Usuarios internos |
| Role | Roles |
| Customer | Clientes |
| Employee | Barberos/empleados |
| Barbershop | Barberías |
| Service | Servicios |
| Schedule | Horarios |
| Reservation | Reservas |
| ServiceReservation | Servicios dentro de una reserva |
| ReservationReview | Reseñas |
| Notification | Notificaciones y correo |
| Queue | Cola virtual |
| Subscription | Planes |
| SubscriptionBarber | Suscripciones contratadas |
| Transaction | Pagos |
| WebSocket | Pago y cola en tiempo real |
| Scheduler | Renovación/expiración automática |

---

# 51. Mapa mental rápido para una IA

```text
SMARTBARBER BACKEND

├── AUTHENTICATION
│   ├── Firebase
│   ├── User
│   └── Role
│
├── BUSINESS
│   ├── Barbershop
│   ├── Employee
│   ├── Customer
│   ├── Service
│   └── Schedule
│
├── RESERVATIONS
│   ├── Reservation
│   ├── ServiceReservation
│   ├── ReservationReview
│   └── Notification
│
├── VIRTUAL QUEUE
│   ├── BarberQueue
│   ├── QueueSnapshot
│   ├── QueueBroadcastService
│   └── WebSocket
│
├── SUBSCRIPTIONS
│   ├── Subscription
│   ├── SubscriptionBarbershop
│   ├── Transaction
│   └── Payment WebSocket
│
└── INFRASTRUCTURE
    ├── PostgreSQL / R2DBC
    ├── Firebase
    ├── Gmail SMTP
    ├── WebSocket
    └── Scheduler
```

---

# 52. Regla de interpretación para futuras consultas

Si una IA recibe una solicitud relacionada con SmartBarber, debe interpretar primero el módulo afectado y seguir la cadena:

```text
Route
→ Handler
→ DTO
→ Mapper
→ Command/Domain
→ Use Case
→ Port
→ Adapter
→ Database / External Service
```

Para una modificación funcional:

```text
1. identificar endpoint existente o determinar si se necesita uno nuevo;
2. identificar DTO;
3. identificar mapper;
4. identificar command/model;
5. identificar use case;
6. identificar port;
7. identificar adapter;
8. revisar entity/data/mapper de PostgreSQL;
9. revisar seguridad;
10. revisar WebSocket/eventos si la funcionalidad es en tiempo real;
11. revisar transacciones;
12. revisar estados/enums relacionados.
```

No asumir que una funcionalidad existe solamente porque existe su entidad. La existencia de una clase no significa necesariamente que exista un endpoint funcional para ella.

---

# 53. Fuente de verdad

Para modificaciones futuras, el **código fuente actual** debe considerarse la fuente de verdad sobre:

- rutas;
- nombres de DTO;
- campos;
- tipos;
- estados;
- relaciones;
- comportamiento de los Use Cases;
- permisos;
- comunicación WebSocket;
- integración con Firebase;
- integración de pagos.

Este documento es un **mapa contextual optimizado**, no un sustituto del código fuente. Si existe una contradicción entre este documento y el código, debe prevalecer el código fuente.

