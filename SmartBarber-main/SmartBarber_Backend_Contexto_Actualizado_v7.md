# SmartBarber — Contexto del Backend (Actualización v7)

> Documento generado a partir del ZIP `SmartBarber(7).zip`, tomando como fuente `src/main/java` y `src/main/resources/application.yaml`. Se documenta el estado actual del código incluido en el ZIP; no se incorporan suposiciones externas.

## 1. Resumen ejecutivo

- Backend reactivo con **Spring Boot 4.0.8**, **Java 21**, **Spring WebFlux**, **Spring Security WebFlux**, **R2DBC/PostgreSQL**, Firebase Admin, MapStruct, Mail y WebSocket.
- Arquitectura por capas con orientación **Clean/Hexagonal**: dominio + puertos, casos de uso, entrypoints HTTP/WebSocket y adapters de infraestructura.
- La autenticación mantiene el flujo Firebase UID → User → Customer/Employee y ahora `/auth/verify` entrega una respuesta enriquecida con IDs y contexto de barbería.
- Se mantiene el módulo de **cola virtual** con REST + WebSocket.
- El módulo de suscripciones de barbería incluye creación, renovación y consulta de la suscripción actual por `barberId`.

## 2. Stack y configuración

```text
Spring Boot 4.0.8
Java 21
Spring WebFlux / Reactor
Spring Security WebFlux
Spring Data R2DBC + PostgreSQL
r2dbc-pool
Firebase Admin 9.11.0
MapStruct 1.6.3
Spring Mail
WebSocket
Gradle
```

### Dependencias relevantes
```gradle
implementation "io.r2dbc:r2dbc-pool"
implementation "com.auth0:java-jwt:4.6.1"
implementation "com.google.firebase:firebase-admin:9.11.0"
implementation "org.springframework.boot:spring-boot-starter-data-r2dbc"
implementation "org.springframework.boot:spring-boot-starter-webflux"
implementation "org.springframework.boot:spring-boot-starter-mail"
implementation "org.springframework.boot:spring-boot-starter-validation"
implementation "org.springframework.boot:spring-boot-starter-security"
implementation "org.mapstruct:mapstruct:1.6.3"
```

### `application.yaml`
```yaml
spring:
  application:
    name: smart_barber
  r2dbc:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    pool:
      enabled: true
      initial-size: 5
      max-size: 20
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
logging:
  level:
    org.springframework.data.r2dbc: DEBUG
    org.springframework.r2dbc: DEBUG
payment:
  key: ${PAYMENT_KEY}
  timeout: 15
```

## 3. Arquitectura

```text
HTTP / WebSocket
      ↓
Entrypoint reactivo
      ↓
Handlers / DTOs / Mappers
      ↓
Application Use Cases
      ↓
Domain Models + Ports
      ↑
Driven Adapters
  ├─ PostgreSQL / R2DBC
  ├─ Firebase
  ├─ Email
  └─ WebSocket / cola
```

### Flujo HTTP estándar
1. `SecurityConfig` + `JwtFilter` procesan la solicitud.
2. Un `RouterFunction` determina el handler.
3. El handler convierte el body a DTO y valida cuando corresponde.
4. MapStruct transforma DTO ↔ command/domain.
5. El caso de uso aplica la lógica.
6. El caso de uso utiliza un puerto de dominio.
7. Un adapter implementa el puerto y accede a R2DBC/Firebase/u otro recurso.
8. El resultado vuelve por mapper y `ServerResponse`.

## 4. Autenticación y respuesta de sesión — actualización importante

### `POST /auth/verify`
El endpoint lee el header `Authorization` y ejecuta `AuthenticationUC.authorizationSession(...)`. La respuesta actual es `AuthorizationRsDto`.

### Respuesta actual
```java
public record AuthorizationRsDto(
    RoleType role,
    UUID userId,
    UUID employeeId,
    BarbershopSubscriptionRsDto barbershop,
    UUID customerId
) {}
```

### Estructura de `barbershop`
```java
public record BarbershopSubscriptionRsDto(
    UUID id,
    String name,
    String location,
    String phone,
    SubscriptionBarbershopAuthRsDto subscription
) {}

public record SubscriptionBarbershopAuthRsDto(
    SubscriptionBarberStatus status
) {}
```

### Flujo actual de `AuthenticationUC`
```text
Firebase ID token
  ↓
FirebaseAuthPort.isValidToken()
  ↓
FirebaseAuthPort.getUid()
  ↓
UserPort.findByFirebaseId()
  ↓
RolePort.findById()
  ↓
si CUSTOMER ─────────────→ CustomerPort.findByUserId()
  │                         ↓
  │                       Authentication(customer,user)
  │
  └─ si BARBER/ADMIN → EmployeePort.findByUserId()
                           ↓
                    BarberShopRepositoryPort.findById(employee.barberiaId)
                           +
                    SubscriptionBarbershopRepositoryPort.findByBarberIdAndStatus(ACTIVE)
                           ↓
                    Authentication(barbershop,employee,user)
```

Esto significa que para un empleado la barbería se resuelve de forma server-side mediante `Employee.barberiaId`; no depende de que el frontend conserve un `barbershopId` previo. Para cliente, `customerId` se obtiene desde `Customer`.

### Mapeo de roles
`AuthorizationEntryMapper` obtiene `role` desde `user.roleId` mediante `RoleType.fromId(roleId)`.

### Archivos clave de autenticación
- `application/usecase/athentication/AuthenticationUC.java`
- `domain/model/Authentication.java`
- `infrastructure/entrypoint/reactiveweb/dto/authorization/AuthorizationRsDto.java`
- `infrastructure/entrypoint/reactiveweb/dto/barbershop/BarbershopSubscriptionRsDto.java`
- `infrastructure/entrypoint/reactiveweb/dto/subscriptionbarber/SubscriptionBarbershopAuthRsDto.java`
- `infrastructure/entrypoint/reactiveweb/mapper/authorization/AuthorizationEntryMapper.java`
- `infrastructure/entrypoint/reactiveweb/handler/firebase/FirebaseTestHandler.java`
- `infrastructure/entrypoint/reactiveweb/handler/firebase/FirebaseTestRuta.java`

## 5. Seguridad HTTP

`SecurityConfig` deshabilita CSRF y configura CORS con origen/métodos/headers `*` y `allowCredentials=false`.

Rutas configuradas como públicas en `SecurityConfig`: `/ws/payment/**`, `/auth/**`, `/reservation-service/**`, `/schedule-service/**`, `/services-service/**`, `/customer-service/**`, `/reservation-review-service/**`, `/notification-service/**`, `/public/**`.

Cola virtual: `POST /api/v1/queue/join` requiere CUSTOMER; operaciones `open/close/next/complete` requieren BARBER; `GET /api/v1/queue/**` permite CUSTOMER/BARBER/ADMIN. `GET /user-service/**` requiere BARBER. El resto requiere autenticación.

### `JwtFilter`
El filtro omite JWT para `/auth`, `/reservation-service`, `/schedule-service` y `/public`. Si hay Bearer token válido, usa `AuthenticationUC.authorization()` y crea `ROLE_CUSTOMER`, `ROLE_BARBER` o `ROLE_ADMIN`.

**Observación técnica:** `SecurityConfig` declara más rutas `permitAll` que las que `JwtFilter.isPublicPath()` identifica explícitamente. Esto debe tenerse en cuenta al modificar seguridad, aunque Spring Security sigue siendo la autoridad final sobre `authorizeExchange`.

## 6. Endpoints HTTP actuales

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/handler/barbershop/BarbershopRouter.java`

- `return RouterFunctions.route(RequestPredicates.POST(PUBLIC + BARBER_SERVICE + "/create-barber"), barbershopHandler::createBarbershop)`

- `.andRoute(RequestPredicates.POST(PUBLIC + BARBER_SERVICE + "/onboarding"), barbershopHandler::onBoardingBarber)`

- `.andRoute(RequestPredicates.GET(BARBER_SERVICE + "/name/{name}"), barbershopHandler::findBarbershopByName)`

- `.andRoute(RequestPredicates.GET(BARBER_SERVICE + "/find-all"), barbershopHandler::findAllBarberShop)`

- `.andRoute(RequestPredicates.GET(BARBER_SERVICE + "/company-name/{companyName}"), barbershopHandler::findBarbershopByCompanyName)`

- `.andRoute(RequestPredicates.GET(BARBER_SERVICE + "/document/{document}"), barbershopHandler::findByBarbershopByDocument)`

- `.andRoute(RequestPredicates.GET(BARBER_SERVICE + "/id/{id}"), barbershopHandler::findBarbershopById)`

- `.andRoute(RequestPredicates.PUT(BARBER_SERVICE + "/update-barber/{id}"), barbershopHandler::updateBarbershop);`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/handler/customer/CustomerRout.java`

- `return RouterFunctions.route(RequestPredicates.POST(PUBLIC + CUSTOMER_SERVICE + "/create-customer"), customerHandler::createCustomer)`

- `.andRoute(RequestPredicates.POST(PUBLIC + CUSTOMER_SERVICE + "/onboarding"), customerHandler::onBoardCustomer)`

- `.andRoute(RequestPredicates.GET(CUSTOMER_SERVICE + "/name/{name}"), customerHandler::findCustomerByName)`

- `.andRoute(RequestPredicates.GET(CUSTOMER_SERVICE + "/document/{document}"), customerHandler::findByCustomerByDocument)`

- `.andRoute(RequestPredicates.GET(CUSTOMER_SERVICE + "/id/{id}"), customerHandler::findCustomerById)`

- `.andRoute(RequestPredicates.PUT(CUSTOMER_SERVICE + "/update-customer/{id}"), customerHandler::updateCustomer);`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/handler/employee/EmployeeRuta.java`

- `return RouterFunctions.route(RequestPredicates.POST(PUBLIC + EMPLOYEE_SERVICE + "/crear-empleado"), employeeHandler::createEmployee)`

- `.andRoute(RequestPredicates.POST(PUBLIC + EMPLOYEE_SERVICE + "/onboarding"), employeeHandler::onBoarding)`

- `.andRoute(RequestPredicates.GET(PUBLIC + EMPLOYEE_SERVICE + "/barbershop/{barberId}"),employeeHandler::findEmployeeByBarbershop)`

- `.andRoute(RequestPredicates.GET(EMPLOYEE_SERVICE + "/nombre/{nombre}"),employeeHandler::findEmployeeByName)`

- `.andRoute(RequestPredicates.GET(EMPLOYEE_SERVICE + "/documento/{documento}"),employeeHandler::findByEmployeeByDocument)`

- `.andRoute(RequestPredicates.GET(EMPLOYEE_SERVICE + "/id/{id}"),employeeHandler::findEmployeeById)`

- `.andRoute(RequestPredicates.PUT(EMPLOYEE_SERVICE + "/actualizar-empleado/{id}"),employeeHandler::updateEmployee);`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/handler/firebase/FirebaseTestRuta.java`

- `POST("/auth/verify"),`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/handler/notification/NotificationRuta.java`

- `RequestPredicates.POST(NOTIFICATION_SERVICE + "/crear-notificacion"),`

- `RequestPredicates.GET(NOTIFICATION_SERVICE + "/id/{id}"),`

- `RequestPredicates.GET(NOTIFICATION_SERVICE + "/reserva/{reservationId}"),`

- `RequestPredicates.GET(NOTIFICATION_SERVICE + "/cliente/{customerId}"),`

- `RequestPredicates.PUT(NOTIFICATION_SERVICE + "/actualizar-notificacion/{id}"),`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/handler/queue/VirtualQueueRouter.java`

- `.POST(`

- `.POST(`

- `.POST(`

- `.POST(`

- `.POST(`

- `.GET(`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/handler/reservation/ReservationRouter.java`

- `RequestPredicates.POST(RESERVATION + "/create"),`

- `RequestPredicates.GET(RESERVATION + "/{id}"),`

- `RequestPredicates.GET(RESERVATION + "/employee/{employeeId}"),`

- `RequestPredicates.GET(RESERVATION + "/customer/{customerId}"),`

- `RequestPredicates.GET(RESERVATION + "/barber/{barberId}"),`

- `RequestPredicates.PATCH(RESERVATION + "/{id}/confirm"),`

- `RequestPredicates.PATCH(RESERVATION + "/{id}/cancel"),`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/handler/reservationreview/ReservationReviewRuta.java`

- `return RouterFunctions.route(RequestPredicates.POST( RESERVATION_REVIEW_SERVICE + "/crear-resena-reserva"),reservationReviewHandler::createReservationReview)`

- `.andRoute(RequestPredicates.GET(RESERVATION_REVIEW_SERVICE + "/id/{id}"),reservationReviewHandler::findReservationReviewById)`

- `.andRoute(RequestPredicates.GET(RESERVATION_REVIEW_SERVICE + "/reserva/{reservationId}"),reservationReviewHandler::findReservationReviewByReservationId)`

- `.andRoute(RequestPredicates.PUT(RESERVATION_REVIEW_SERVICE + "/actualizar-resena-reserva/{id}"),reservationReviewHandler::updateReservationReview);`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/handler/role/RoleRuta.java`

- `return RouterFunctions.route(RequestPredicates.POST(ROLE_SERVICE + "/create-role"),roleHandler::createRole)`

- `.andRoute(RequestPredicates.GET(ROLE_SERVICE + "/id/{id}"), roleHandler::findRoleById)`

- `.andRoute(RequestPredicates.PUT(ROLE_SERVICE + "/update-role/{id}"), roleHandler::updateRole);`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/handler/scheduler/SchedulerRuta.java`

- `return RouterFunctions.route(RequestPredicates.POST(SCHEDULE_SERVICE + "/crear-schedule"),schedulerHandler::createSchedule)`

- `.andRoute(RequestPredicates.GET(SCHEDULE_SERVICE + "/id/{id}"),schedulerHandler::findScheduleById)`

- `.andRoute(RequestPredicates.GET(SCHEDULE_SERVICE + "/empleado/{empleadoId}"),schedulerHandler::findScheduleByEmpleadoId)`

- `.andRoute(RequestPredicates.PUT(SCHEDULE_SERVICE + "/actualizar-schedule/{id}"),schedulerHandler::updateSchedule);`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/handler/service/ServiceRuta.java`

- `return RouterFunctions.route(RequestPredicates.POST(SERVICES_SERVICE + "/crear-servicio"),serviceHandler::createService)`

- `.andRoute(RequestPredicates.GET(SERVICES_SERVICE + "/name/{name}"),serviceHandler::findServiceByName)`

- `.andRoute(RequestPredicates.GET(SERVICES_SERVICE + "/id/{id}"),serviceHandler::findServiceById)`

- `.andRoute(RequestPredicates.PUT(SERVICES_SERVICE + "/actualizar-service/{id}"),serviceHandler::updateService)`

- `.andRoute(RequestPredicates.GET(SERVICES_SERVICE + "/barberia/{barberiaId}"), serviceHandler::findServicesByBarberiaId);`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/handler/subscription/SubscriptionRouter.java`

- `return RouterFunctions.route(RequestPredicates.POST(SUBSCRIPTION_SERVICE + "/create-subscription"),handler::createSubscription)`

- `.andRoute(RequestPredicates.GET(SUBSCRIPTION_SERVICE + "/all"),handler::getAllSubscription)`

- `.andRoute(RequestPredicates.GET(SUBSCRIPTION_SERVICE + "/id/{id}"),handler::getSubscription);`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/handler/subscriptionbarber/SubscriptionBarbershopRouter.java`

- `return RouterFunctions.route(RequestPredicates.POST(SUBSCRIPTION_BARBER_SERVICE+ "/create"), handler::createSubscriptionForBarber)`

- `.andRoute(RequestPredicates.PUT(SUBSCRIPTION_BARBER_SERVICE+ "/renew"), handler::renewSubscriptionForBarber)`

- `.andRoute(RequestPredicates.GET(SUBSCRIPTION_BARBER_SERVICE+ "/actual-subscription/{barberId}"), handler::findActualSubscriptionByBarberId);`

- `//.andRoute(RequestPredicates.PUT(SUBSCRIPTION_BARBER_SERVICE+ "/renew"), handler::renewSubscriptionForBarber);`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/handler/user/UserRuta.java`

- `return RouterFunctions.route(RequestPredicates.POST(PUBLIC + USER_SERVICE + "/crear-usuario"),userHandler::createUser)`

- `.andRoute(RequestPredicates.GET(USER_SERVICE + "/id/{id}"),userHandler::SearchUserId)`

- `.andRoute(RequestPredicates.PUT(USER_SERVICE + "/actualizar-usuario/{id}"),userHandler::updateUser);`


### Resumen funcional de endpoints

| Módulo | Endpoint |
|---|---|

| Auth | `POST /auth/verify` |

| Barbería | `POST /public/barber-service/create-barber` |

| Barbería | `POST /public/barber-service/onboarding` |

| Barbería | `GET /barber-service/name/{name}` |

| Barbería | `GET /barber-service/find-all` |

| Barbería | `GET /barber-service/company-name/{companyName}` |

| Barbería | `GET /barber-service/document/{document}` |

| Barbería | `GET /barber-service/id/{id}` |

| Barbería | `PUT /barber-service/update-barber/{id}` |

| Empleado | `POST /public/employee-service/crear-empleado` |

| Empleado | `POST /public/employee-service/onboarding` |

| Empleado | `GET /public/employee-service/barbershop/{barberId}` |

| Empleado | `GET /employee-service/nombre/{nombre}` |

| Empleado | `GET /employee-service/documento/{documento}` |

| Empleado | `GET /employee-service/id/{id}` |

| Empleado | `PUT /employee-service/actualizar-empleado/{id}` |

| Cliente | `POST /public/customer-service/create-customer` |

| Cliente | `POST /public/customer-service/onboarding` |

| Cliente | `GET /customer-service/name/{name}` |

| Cliente | `GET /customer-service/document/{document}` |

| Cliente | `GET /customer-service/id/{id}` |

| Cliente | `PUT /customer-service/update-customer/{id}` |

| Usuario | `POST /public/user-service/crear-usuario` |

| Usuario | `GET /user-service/id/{id}` |

| Usuario | `PUT /user-service/actualizar-usuario/{id}` |

| Rol | `POST /role-service/create-role` |

| Rol | `GET /role-service/id/{id}` |

| Rol | `PUT /role-service/update-role/{id}` |

| Horario | `POST /schedule-service/crear-schedule` |

| Horario | `GET /schedule-service/id/{id}` |

| Horario | `GET /schedule-service/empleado/{empleadoId}` |

| Horario | `PUT /schedule-service/actualizar-schedule/{id}` |

| Servicio | `POST /services-service/crear-servicio` |

| Servicio | `GET /services-service/name/{name}` |

| Servicio | `GET /services-service/id/{id}` |

| Servicio | `PUT /services-service/actualizar-service/{id}` |

| Servicio | `GET /services-service/barberia/{barberiaId}` |

| Reserva | `POST /reservation-service/create` |

| Reserva | `GET /reservation-service/{id}` |

| Reserva | `GET /reservation-service/employee/{employeeId}` |

| Reserva | `GET /reservation-service/customer/{customerId}` |

| Reserva | `GET /reservation-service/barber/{barberId}` |

| Reserva | `PATCH /reservation-service/{id}/confirm` |

| Reserva | `PATCH /reservation-service/{id}/cancel` |

| Reseña | `POST /reservation-review-service/crear-resena-reserva` |

| Reseña | `GET /reservation-review-service/id/{id}` |

| Reseña | `GET /reservation-review-service/reserva/{reservationId}` |

| Reseña | `PUT /reservation-review-service/actualizar-resena-reserva/{id}` |

| Notificación | `POST /notification-service/crear-notificacion` |

| Notificación | `GET /notification-service/id/{id}` |

| Notificación | `GET /notification-service/reserva/{reservationId}` |

| Notificación | `GET /notification-service/cliente/{customerId}` |

| Notificación | `PUT /notification-service/actualizar-notificacion/{id}` |

| Suscripción catálogo | `POST /subscription-service/create-subscription` |

| Suscripción catálogo | `GET /subscription-service/all` |

| Suscripción catálogo | `GET /subscription-service/id/{id}` |

| Suscripción barbería | `POST /subscription-barbershop-service/create` |

| Suscripción barbería | `PUT /subscription-barbershop-service/renew` |

| Suscripción barbería | `GET /subscription-barbershop-service/actual-subscription/{barberId}` |

| Cola virtual | `POST /api/v1/queue/{employeeId}/open` |

| Cola virtual | `POST /api/v1/queue/{employeeId}/close` |

| Cola virtual | `POST /api/v1/queue/{employeeId}/next` |

| Cola virtual | `POST /api/v1/queue/{employeeId}/complete` |

| Cola virtual | `POST /api/v1/queue/join` |

| Cola virtual | `GET /api/v1/queue/{employeeId}` |


## 7. DTOs de entrada/salida

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/User/UserRqDto.java`

- `@NotNull(message = "El roleId es obligatorio"`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/User/UserRsDto.java`

- `UUID id`

- `String firebaseId`

- `UserStatus status`

- `Instant createAt`

- `Instant updateAt`

- `Short roleId`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/authorization/AuthorizationRsDto.java`

- `RoleType role`

- `UUID userId`

- `UUID employeeId`

- `BarbershopSubscriptionRsDto barbershop`

- `UUID customerId`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/barbershop/BarbershopOnBoardingRqDto.java`

- `@NotBlank(message = "El name es obligatorio"`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/barbershop/BarbershopOnBoardingRsDto.java`

- `UUID id`

- `String name`

- `String description`

- `String location`

- `String phone`

- `String document`

- `DocumentType documentType`

- `String companyName`

- `EmployeeOnboardingRsDto employee`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/barbershop/BarbershopRqDto.java`

- `@NotBlank(message = "El name es obligatorio"`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/barbershop/BarbershopRsDto.java`

- `UUID id`

- `String name`

- `String description`

- `String location`

- `String phone`

- `String document`

- `DocumentType documentType`

- `String companyName`

- `String status`

- `Instant createAt`

- `Instant updateAt`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/barbershop/BarbershopSubscriptionRsDto.java`

- `UUID id`

- `String name`

- `String location`

- `String phone`

- `SubscriptionBarbershopAuthRsDto subscription`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/customer/CustomerOnboardingRqDto.java`

- `@NotNull(message = "El id del usuario es obligatorio"`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/customer/CustomerOnboardingRsDto.java`

- `UUID id`

- `UserRsDto user`

- `String document`

- `DocumentType documentType`

- `String name`

- `String cell`

- `String email`

- `Instant createAt`

- `Instant updateAt`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/customer/CustomerRqDto.java`

- `@NotNull(message = "El id del usuario es obligatorio"`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/customer/CustomerRsDto.java`

- `UUID id`

- `UUID userId`

- `String document`

- `DocumentType documentType`

- `String name`

- `String cell`

- `String email`

- `Instant createAt`

- `Instant updateAt`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/employee/EmployeeOnboardingRqDto.java`

- `@NotNull(message = "El id del usuario es obligatorio"`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/employee/EmployeeOnboardingRsDto.java`

- `UUID id`

- `String name`

- `String document`

- `DocumentType documentType`

- `String cell`

- `String email`

- `String specialty`

- `UserRsDto user`

- `Instant createAt`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/employee/EmployeeRqDto.java`

- `@NotNull(message = "El id de la barberia es obligatorio"`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/employee/EmployeeRsDto.java`

- `UUID id`

- `UUID userId`

- `UUID barberiaId`

- `String document`

- `DocumentType documentType`

- `String name`

- `String cell`

- `String email`

- `String specialty`

- `Instant createAt`

- `Instant updateAt`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/error/ErrorRsDto.java`

- `String reason`

- `String code`

- `String message`

- `Instant date`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/notification/NotificationRqDto.java`

- `@NotNull(message = "Customer ID cannot be null"`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/notification/NotificationRsDto.java`

- `UUID id`

- `UUID customerId`

- `UUID reservationId`

- `String title`

- `String content`

- `String channelType`

- `String eventType`

- `String status`

- `Integer retries`

- `String messageError`

- `Instant scheduledDate`

- `Instant dateSent`

- `Instant createAt`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/reservationreview/ReservationReviewRqDto.java`

- `@NotNull(message = "El id de la reserva es obligatorio"`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/reservationreview/ReservationReviewRsDto.java`

- `Integer id`

- `UUID reservationId`

- `Integer qualification`

- `String comment`

- `Instant createAt`

- `Instant updateAt`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/role/RoleRqDto.java`

- `@NotNull RoleType roleType`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/role/RoleRsDto.java`

- `Short id`

- `RoleType roleType`

- `String status`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/schedule/ScheduleRqDto.java`

- `@NotNull(message = "El empleado es obligatorio"`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/schedule/ScheduleRsDto.java`

- `Integer id`

- `UUID empleadoId`

- `LocalTime startTime`

- `LocalTime endTime`

- `LocalTime lunchStartTime`

- `LocalTime lunchEndTime`

- `Boolean vacation`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/service/ServiceRqDto.java`

- `@NotNull(message = "El id de la barberia es obligatorio"`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/service/ServiceRsDto.java`

- `Integer id`

- `UUID barberiaId`

- `String name`

- `String description`

- `Integer duration`

- `Boolean status`

- `Boolean offert`

- `Integer price`

- `Integer special_price`

- `Instant createAt`

- `Instant updateAt`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/subscription/SubscriptionRqDto.java`

- `String name`

- `String description`

- `Integer price`

- `Byte discount`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/subscription/SubscriptionRsDto.java`

- `Integer id`

- `String name`

- `String description`

- `BigInteger price`

- `Byte discount`

- `Instant createAt`

- `Instant updateAt`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/subscriptionbarber/SubscriptionBarbershopAuthRsDto.java`

- `SubscriptionBarberStatus status`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/subscriptionbarber/SubscriptionBarbershopRqDto.java`

- `@NotNull(message = "El barberId es obligatorio"`

### `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/subscriptionbarber/SubscriptionBarbershopRsDto.java`

- `UUID id`

- `UUID barberId`

- `Integer subscriptionId`

- `SubscriptionBarberStatus status`

- `Integer duration`

- `BigInteger subscriptionPrice`

- `Byte subscriptionDiscount`

- `UUID orderId`

- `Instant createdAt`

- `Instant updatedAt`

- `Instant startDate`

- `Instant expirationDate`


## 8. Enums

### `DocumentType`

`CC`, `CE`, `NIT`


### `ReservationStatus`

`PENDING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `WAITING`, `NO_SHOW`


### `ReservationType`

`VIRTUAL_QUEUE`, `SERVICE_RESERVATION`


### `RoleType`

`ADMIN`, `BARBER`, `CUSTOMER`


### `ServiceReservationStatus`

`COMPLETED`, `ACTIVE`, `CANCEL`


### `SubscriptionBarberStatus`

`ACTIVE`, `APPROVED`, `PENDING`, `DECLINED`, `NOT_SUBSCRIPTION`, `EXPIRED`, `REFUNDED`, `CANCELED`


### `SubscriptionType`

`CREATE`, `RENEW`, `EXPIRED`


### `TransactionStatus`

`PENDING`, `APPROVED`, `REJECTED`, `CANCELED`, `REFUNDED`


### `TransactionType`

`BOOKING_TRANSACTION`, `SUBSCRIPTION_TRANSACTION`


### `UserStatus`

`ACTIVE`, `BLOCKED`, `PENDING`


## 9. Casos de uso

- `AuthenticationUC`
- `BarbershopUpdateUC`
- `CreateBarbershopUC`
- `FindBarbershopUC`
- `OnboardingBarberShopUc`
- `CreateCustomerUC`
- `SearchCustomerUC`
- `UpdateCustomerUC`
- `CreateEmployeeUC`
- `SearchEmployeeUC`
- `UpdateEmployeeUC`
- `CreateNotificationUC`
- `SearchNotificationUC`
- `UpdateNotificationUC`
- `CloseQueueUC`
- `CompleteCurrentTurnUC`
- `JoinQueueUC`
- `NextCustomerUC`
- `OpenQueueUC`
- `QueueAvailabilityService`
- `QueueBroadcastService`
- `SubscribeQueueUC`
- `ChangeReservationStatusUc`
- `CreateReservationQueueUc`
- `CreateReservationUc`
- `FindReservationUc`
- `CreateReservationReviewUC`
- `SearchReservationReviewUC`
- `UpdateReservationReviewUC`
- `CreateRoleUC`
- `RoleUpdateUC`
- `SearchRoleUC`
- `CreateScheduleUC`
- `SearchScheduleUC`
- `UpdateScheduleUC`
- `CreateServiceUC`
- `SearchServiceUC`
- `UpdateServiceUC`
- `CreateSubscriptionUC`
- `FindSubscriptionUC`
- `CreateSubscriptionBarberUC`
- `ExecuteSubscriptionBarberUC`
- `ExpiredSubscriptionUc`
- `FindSubscriptionBarberUC`
- `RenewSubscriptionUC`
- `SendMessageUC`
- `UpdateSubscriptionBarberStatusUC`
- `CreateTransactionUC`
- `FindTransactionUc`
- `UpdateTransactionUC`
- `WaitMessageResponseUC`
- `CreateUserUC`
- `SearchUserUC`
- `UpdateUserUC`

## 10. Puertos de dominio

- `BarberShopRepositoryPort`
- `CustomerPort`
- `EmployeePort`
- `FirebaseAuthPort`
- `NotificationPort`
- `ReservationReviewPort`
- `RolePort`
- `SchedulePort`
- `ServicePort`
- `UserPort`
- `MessageNotificationPort`
- `MessageResponsePort`
- `BarberQueuePort`
- `QueueManagementPort`
- `QueuePort`
- `QueueSubscriptionPort`
- `UserEventPublisherPort`
- `ReservationRepositoryPort`
- `ServiceReservationPort`
- `SubscriptionRepositoryPort`
- `SubscriptionBarbershopRepositoryPort`
- `TransactionRepositoryPort`

## 11. Persistencia PostgreSQL/R2DBC

### Entidades R2DBC
- `BarberQueueEntity`
- `BarbershopEntity`
- `CustomerEntity`
- `EmployeeEntity`
- `NotificationEntity`
- `ReservationEntity`
- `ReservationReviewEntity`
- `RoleEntity`
- `ScheduleEntity`
- `ServiceEntity`
- `ServiceReservationEntity`
- `SubscriptionBarbershopEntity`
- `SubscriptionEntity`
- `TransactionEntity`
- `UserEntity`

### Interfaces Data/Repository
- `BarberQueueData`
- `BarbershopData`
- `CustomerData`
- `EmployeeData`
- `NotificationData`
- `ReservationData`
- `ReservationReviewData`
- `RoleData`
- `ScheduleData`
- `ServiceData`
- `ServiceReservationData`
- `SubscriptionBarbershopData`
- `SubscriptionData`
- `TransactionData`
- `UserData`

### Adapters
- `BarberQueueAdapter`
- `BarbershopAdapter`
- `CustomerAdapter`
- `EmployeeAdapter`
- `NotificationAdapter`
- `ReservationAdapter`
- `ReservationReviewAdapter`
- `RoleAdapter`
- `ScheduleAdapter`
- `ServiceAdapter`
- `ServiceReservationAdapter`
- `SubscriptionAdapter`
- `SubscriptionBarbershopAdapter`
- `TransactionAdapter`
- `UserAdapter`

### Flujo
`Domain Port → Postgres Adapter → Data/Repository → Entity → PostgreSQL`.

## 12. Modelos de dominio
- `Authentication`
- `VirtualQueue`
- `BarberShopOnboarding`
- `Barbershop`
- `BarbershopResponse`
- `Customer`
- `CustomerOnboarding`
- `CustomerResponse`
- `Employee`
- `EmployeeOnbording`
- `Notification`
- `QueueSnapshot`
- `QueueReservation`
- `UserEvent`
- `VirtualQueue`
- `Reservation`
- `ReservationResponse`
- `ServiceReservation`
- `ServiceReservationResponse`
- `ReservationReview`
- `Role`
- `Schedule`
- `Service`
- `SubscriptionBarbershop`
- `SubscriptionBarbershopResponse`
- `Subscription`
- `Transaction`
- `User`

## 13. Cola virtual

La cola virtual combina REST y WebSocket. Los endpoints REST permiten abrir/cerrar cola, avanzar al siguiente cliente, completar el turno, ingresar a la cola y consultar el snapshot. `QueueBroadcastService` publica cambios para los clientes conectados y `VirtualQueueWsHandler` atiende `/ws/virtual-queue`.

### REST
- `POST /api/v1/queue/{employeeId}/open`
- `POST /api/v1/queue/{employeeId}/close`
- `POST /api/v1/queue/{employeeId}/next`
- `POST /api/v1/queue/{employeeId}/complete`
- `POST /api/v1/queue/join`
- `GET /api/v1/queue/{employeeId}`

### WebSocket
- `/ws/virtual-queue`
- `/ws/payment`

## 14. Suscripciones

El catálogo de suscripciones se maneja por `subscription-service`. La relación de una barbería con una suscripción se maneja por `subscription-barbershop-service`. En la autenticación, `AuthenticationUC` consulta la suscripción ACTIVE asociada al `employee.barberiaId`; si no existe devuelve el estado de dominio `NOT_SUBSCRIPTION`.

**Nueva ruta destacada en esta actualización:** `GET /subscription-barbershop-service/actual-subscription/{barberId}`.

## 15. WebSocket y eventos

`WebsocketConfig` registra `/ws/payment` y `/ws/virtual-queue`. La infraestructura contiene manejadores de pago, cola virtual, gestores de conexión y DTOs/eventos de WebSocket.

## 16. Manejo de errores

`GlobalHandlerError` implementa `ErrorWebExceptionHandler`. La respuesta de error usa `ErrorRsDto` con `reason`, `code`, `message` y `date`, dentro del wrapper `data`. Las excepciones de negocio se traducen a 409; errores de request a 400; errores internos a 500 y otros errores técnicos a 503 según la lógica del handler actual.

## 17. Scheduling

La clase principal mantiene `@EnableScheduling`. Existe `RenewAutomaticSubscription`; en el estado revisado las anotaciones `@Scheduled` observadas continúan comentadas, por lo que no debe asumirse que el proceso automático está ejecutándose solo por existir la clase.

## 18. Reglas y relaciones importantes

- `User` se relaciona con `Employee` mediante `userId` para usuarios BARBER/ADMIN.
- `Employee.barberiaId` determina la barbería del empleado.
- `User` se relaciona con `Customer` mediante `userId` para CUSTOMER.
- `RoleType` soporta `CUSTOMER`, `BARBER`, `ADMIN`.
- La respuesta de `/auth/verify` es la fuente backend de contexto de sesión: rol + user + employee/customer + barbería + estado de suscripción.
- El frontend que consuma esta versión debe mapear especialmente `employeeId` y `barbershop.id` para construir su sesión local.

## 19. Archivos clave

- `src/main/java/com/smartbarber/application/usecase/athentication/AuthenticationUC.java`
- `src/main/java/com/smartbarber/domain/model/Authentication.java`
- `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/handler/firebase/FirebaseTestHandler.java`
- `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/handler/firebase/FirebaseTestRuta.java`
- `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/mapper/authorization/AuthorizationEntryMapper.java`
- `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/config/SecurityConfig.java`
- `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/config/JwtFilter.java`
- `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/handler/subscriptionbarber/SubscriptionBarbershopRouter.java`
- `src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/handler/subscriptionbarber/SubscriptionBarbershopHandler.java`
- `src/main/java/com/smartbarber/infrastructure/entrypoint/websocket/config/WebsocketConfig.java`
- `src/main/java/com/smartbarber/application/SmartbarberApplication.java`
- `src/main/resources/application.yaml`

## 20. Historial Git incluido en el ZIP
```text
7b0c8f0 (HEAD -> feature/virtual-queue, origin/feature/virtual-queue) Cambio en response authorizacion
7415b29 Cambio en response authorizacion
69db0c1 Cambio en response authorizacion
372a706 Cambios en authorization
0826a50 (origin/main, origin/HEAD, main) Merge pull request #24 from camilo-val/feature/virtual-queue
4fb8253 Merge branch 'main' into feature/virtual-queue
15d67df (nombre-rama) Cambios en servicio de cola virtual y autenticacion
5ab4e31 Ajuste login debido a que el front no toma la respuesta corregida
```

## 21. Cambios destacados de esta actualización

- El historial Git incluido muestra varios commits recientes relacionados explícitamente con **cambios en la respuesta de autorización** (`Cambio en response authorizacion` / `Cambios en authorization`).
- La respuesta actual de autorización está estructurada alrededor de `AuthorizationRsDto` con `role`, `userId`, `employeeId`, `barbershop` y `customerId`.
- La barbería incluida en autorización contiene `id`, `name`, `location`, `phone` y el estado de suscripción.
- Se añadió/está disponible la consulta `GET /subscription-barbershop-service/actual-subscription/{barberId}`.
- El flujo de autenticación de empleado consulta `EmployeePort.findByUserId(...)` y posteriormente la barbería mediante `employee.barberiaId`.

## 22. Observaciones para integración Frontend

1. `POST /auth/verify` ya no debe tratarse como una respuesta que contiene solamente el rol.
2. Para ADMIN/BARBER, el contexto recomendado es: `employeeId → barberId` y `barbershop.id → barbershopId`.
3. Para CUSTOMER, `customerId` es el identificador de cliente.
4. El estado de suscripción está en `barbershop.subscription.status` cuando existe contexto de barbería.
5. El frontend debe mantener sus tipos alineados con `RoleType`: `CUSTOMER`, `BARBER`, `ADMIN`.
6. Para cambios de endpoints, revisar siempre los `RouterFunction` actuales; este backend no usa `@RestController` como mecanismo principal de routing HTTP.

## 23. Estructura de carpetas relevante
```text
src/main/java/com/smartbarber
├── application
│   ├── command
│   ├── mapper
│   └── usecase
├── domain
│   ├── enums
│   ├── exceptions
│   ├── model
│   └── port
└── infrastructure
    ├── drivenadapter
    │   ├── email
    │   ├── firebase
    │   ├── postgres
    │   └── websocket
    └── entrypoint
        ├── reactiveweb
        ├── scheduler
        ├── utils
        └── websocket
```

## 24. Fuente y alcance

Este documento refleja el ZIP `SmartBarber(7).zip` inspeccionado. Se consideraron principalmente `src/main/java`, `src/main/resources/application.yaml`, `build.gradle` y el historial Git incluido. No se tomó `.git`, `build/generated` ni otros artefactos generados como fuente de contratos de código.
