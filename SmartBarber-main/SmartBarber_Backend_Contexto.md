# SmartBarber Backend --- Contexto técnico y funcional

> Documento de contexto generado a partir del código fuente de
> `SmartBarber(6).zip`. Su objetivo es servir como referencia para
> entender arquitectura, lógica, endpoints, requests, responses, DTOs,
> seguridad, persistencia, WebSocket y casos de uso. **Fuente de
> verdad:** `src/main/java` y `src/main/resources/application.yaml`. Los
> directorios `build/`, `bin/` y `.git/` no se consideran fuente
> primaria.

## 1. Resumen ejecutivo

-   **Framework:** Spring Boot `4.0.8`
-   **Java:** 21
-   **Programación reactiva:** Spring WebFlux + Project Reactor
    (`Mono`/`Flux`)
-   **Persistencia:** PostgreSQL mediante Spring Data R2DBC +
    `r2dbc-pool`
-   **Autenticación externa:** Firebase Admin SDK
-   **Seguridad:** Spring Security WebFlux + `JwtFilter` propio
-   **Mapeo:** MapStruct
-   **Validación:** Jakarta Validation
-   **Correo:** Spring Boot Mail / Gmail SMTP
-   **Tiempo real:** WebSocket para pagos y cola virtual
-   **Tareas programadas:** `@EnableScheduling` está activo; la
    renovación automática observada está comentada.

## 2. Arquitectura general

El backend sigue una variante de **Clean/Hexagonal Architecture** con
separación por dominio, aplicación, puertos y adaptadores.

``` text
HTTP/WebSocket
    ↓
Entrypoint / Reactive Web
    ↓
Application / Use Cases
    ↓
Domain / Models + Ports
    ↑
Driven Adapters
    ├── PostgreSQL/R2DBC
    ├── Firebase
    ├── Email
    └── WebSocket
```

### Capas

  ------------------------------------------------------------------------------
  Carpeta                                    Responsabilidad
  ------------------------------------------ -----------------------------------
  `domain/model`                             Entidades/modelos de negocio y
                                             objetos de dominio

  `domain/port`                              Contratos para persistencia,
                                             Firebase, eventos y colas

  `domain/enums`                             Estados y tipos del dominio

  `domain/exceptions`                        Excepciones y mensajes de negocio

  `application/command/in`                   Objetos de entrada usados por casos
                                             de uso

  `application/usecase`                      Reglas/orquestación de cada
                                             operación de negocio

  `infrastructure/entrypoint/reactiveweb`    HTTP: routers, handlers, DTOs,
                                             mappers y errores

  `infrastructure/entrypoint/websocket`      Endpoints WebSocket y eventos

  `infrastructure/drivenadapter/postgres`    Entidades R2DBC, repositories/data,
                                             adapters y mappers

  `infrastructure/drivenadapter/firebase`    Integración con Firebase
                                             Authentication

  `infrastructure/drivenadapter/email`       Envío de correo

  `infrastructure/drivenadapter/websocket`   Cliente/infraestructura WebSocket
                                             de pagos y cola
  ------------------------------------------------------------------------------

## 3. Flujo estándar de una petición HTTP

``` text
Request
  ↓
SecurityConfig / JwtFilter
  ↓
RouterFunction
  ↓
Handler
  ↓
Request DTO / Command
  ↓
Mapper
  ↓
Use Case
  ↓
Domain Port
  ↓
Adapter
  ↓
R2DBC / Firebase / servicio externo
  ↑
Response / Mapper / ServerResponse
```

Los routers son funcionales de Spring WebFlux (`RouterFunction`) y no
usan `@RestController` para estos endpoints.

## 4. Seguridad y autenticación

### 4.1 Firebase

`FirebaseAuthAdapter` implementa `FirebaseAuthPort`. El token Firebase
llega normalmente en:

``` http
Authorization: Bearer <Firebase ID Token>
```

`AuthenticationUC` valida el token, obtiene el UID, busca el `User` por
`firebaseId` y obtiene el `Role` por `roleId`.

### 4.2 Roles

Los roles definidos por `RoleType` son:

  Rol          Uso
  ------------ ------------------
  `CUSTOMER`   Cliente
  `BARBER`     Barbero/empleado
  `ADMIN`      Administrador

### 4.3 Sesión de autenticación

Existe un flujo más completo mediante
`AuthenticationUC.authorizationSession()`.

Para cliente:

``` text
Firebase token → UID → User → Customer → Authentication
```

Para empleado/admin/barbero:

``` text
Firebase token → UID → User → Employee → BarberShop → SubscriptionBarbershop → Authentication
```

La respuesta HTTP se transforma mediante `AuthorizationEntryMapper` a
`AuthorizationRsDto`:

  Campo          Tipo
  -------------- -----------------------------------------
  `role`         `RoleType`
  `userId`       `UUID`
  `employeeId`   `UUID`, nullable
  `barbershop`   `BarbershopSubscriptionRsDto`, nullable
  `customerId`   `UUID`, nullable

## 5. Endpoints HTTP

> Las rutas se construyen con las constantes de `HandlerConstant`. En el
> código algunas constantes no empiezan con `/`; se documentan aquí con
> la forma URL esperada.

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Módulo           Método      Endpoint                                                     Handler                                Entrada                       Respuesta
  ---------------- ----------- ------------------------------------------------------------ -------------------------------------- ----------------------------- ----------------------------------
  Auth             POST        /auth/verify                                                 FirebaseTestHandler.verifyToken        Authorization header          AuthorizationRsDto

  Barbería         POST        /public/barber-service/create-barber                         createBarbershop                       BarbershopRqDto               BarbershopRsDto

  Barbería         POST        /public/barber-service/onboarding                            onBoardingBarber                       BarbershopOnBoardingRqDto +   BarbershopOnBoardingRsDto
                                                                                                                                   Authorization                 

  Barbería         GET         /barber-service/name/{name}                                  findBarbershopByName                   path: name                    BarbershopRsDto

  Barbería         GET         /barber-service/find-all                                     findAllBarberShop                      ---                           List`<BarbershopRsDto>`{=html}

  Barbería         GET         /barber-service/company-name/{companyName}                   findBarbershopByCompanyName            path: companyName             List`<BarbershopRsDto>`{=html}

  Barbería         GET         /barber-service/document/{document}                          findByBarbershopByDocument             path: document                BarbershopRsDto

  Barbería         GET         /barber-service/id/{id}                                      findBarbershopById                     path: id                      BarbershopRsDto

  Barbería         PUT         /barber-service/update-barber/{id}                           updateBarbershop                       BarbershopRqDto + path id     BarbershopRsDto

  Empleado         POST        /public/employee-service/crear-empleado                      createEmployee                         EmployeeRqDto                 EmployeeRsDto

  Empleado         POST        /public/employee-service/onboarding                          onBoarding                             EmployeeOnboardingRqDto +     EmployeeOnboardingRsDto
                                                                                                                                   Authorization                 

  Empleado         GET         /public/employee-service/barbershop/{barberId}               findEmployeeByBarbershop               path barberId                 List`<EmployeeRsDto>`{=html}

  Empleado         GET         /employee-service/nombre/{nombre}                            findEmployeeByName                     path nombre                   EmployeeRsDto

  Empleado         GET         /employee-service/documento/{documento}                      findByEmployeeByDocument               path documento                EmployeeRsDto

  Empleado         GET         /employee-service/id/{id}                                    findEmployeeById                       path id                       EmployeeRsDto

  Empleado         PUT         /employee-service/actualizar-empleado/{id}                   updateEmployee                         EmployeeRqDto + path id       EmployeeRsDto

  Cliente          POST        /public/customer-service/create-customer                     createCustomer                         CustomerRqDto                 CustomerRsDto

  Cliente          POST        /public/customer-service/onboarding                          onBoardCustomer                        CustomerOnboardingRqDto       CustomerOnboardingRsDto

  Cliente          GET         /customer-service/name/{name}                                findCustomerByName                     path name                     CustomerRsDto

  Cliente          GET         /customer-service/document/{document}                        findByCustomerByDocument               path document                 CustomerRsDto

  Cliente          GET         /customer-service/id/{id}                                    findCustomerById                       path id                       CustomerRsDto

  Cliente          PUT         /customer-service/update-customer/{id}                       updateCustomer                         CustomerRqDto + path id       CustomerRsDto

  Usuario          POST        /public/user-service/crear-usuario                           createUser                             UserRqDto                     UserRsDto

  Usuario          GET         /user-service/id/{id}                                        SearchUserId                           path id                       UserRsDto

  Usuario          PUT         /user-service/actualizar-usuario/{id}                        updateUser                             UserRqDto + path id           UserRsDto

  Rol              POST        /role-service/create-role                                    createRole                             RoleRqDto                     RoleRsDto

  Rol              GET         /role-service/id/{id}                                        findRoleById                           path id                       RoleRsDto

  Rol              PUT         /role-service/update-role/{id}                               updateRole                             RoleRqDto + path id           RoleRsDto

  Horarios         POST        /schedule-service/crear-schedule                             createSchedule                         ScheduleRqDto                 ScheduleRsDto

  Horarios         GET         /schedule-service/id/{id}                                    findScheduleById                       path id                       ScheduleRsDto

  Horarios         GET         /schedule-service/empleado/{empleadoId}                      findScheduleByEmpleadoId               path empleadoId               ScheduleRsDto

  Horarios         PUT         /schedule-service/actualizar-schedule/{id}                   updateSchedule                         ScheduleRqDto + path id       ScheduleRsDto

  Servicios        POST        /services-service/crear-servicio                             createService                          ServiceRqDto                  ServiceRsDto

  Servicios        GET         /services-service/name/{name}                                findServiceByName                      path name                     ServiceRsDto

  Servicios        GET         /services-service/id/{id}                                    findServiceById                        path id                       ServiceRsDto

  Servicios        PUT         /services-service/actualizar-service/{id}                    updateService                          ServiceRqDto + path id        ServiceRsDto

  Servicios        GET         /services-service/barberia/{barberiaId}                      findServicesByBarberiaId               path barberiaId               List`<ServiceRsDto>`{=html}

  Reseñas          POST        /reservation-review-service/crear-resena-reserva             createReservationReview                ReservationReviewRqDto        ReservationReviewRsDto

  Reseñas          GET         /reservation-review-service/id/{id}                          findReservationReviewById              path id                       ReservationReviewRsDto

  Reseñas          GET         /reservation-review-service/reserva/{reservationId}          findReservationReviewByReservationId   path reservationId            ReservationReviewRsDto

  Reseñas          PUT         /reservation-review-service/actualizar-resena-reserva/{id}   updateReservationReview                ReservationReviewRqDto + path ReservationReviewRsDto
                                                                                                                                   id                            

  Notificaciones   POST        /notification-service/crear-notificacion                     createNotification                     NotificationRqDto             NotificationRsDto

  Notificaciones   GET         /notification-service/id/{id}                                findNotificationById                   path id                       NotificationRsDto

  Notificaciones   GET         /notification-service/reserva/{reservationId}                findNotificationsByReservationId       path reservationId            List`<NotificationRsDto>`{=html}

  Notificaciones   GET         /notification-service/cliente/{customerId}                   findNotificationsByCustomerId          path customerId               List`<NotificationRsDto>`{=html}

  Notificaciones   PUT         /notification-service/actualizar-notificacion/{id}           updateNotification                     NotificationRqDto + path id   NotificationRsDto

  Reservas         POST        /reservation-service/create                                  createReservation                      ReservationCommand            Reservation

  Reservas         GET         /reservation-service/{id}                                    getReservationById                     path id                       Reservation

  Reservas         GET         /reservation-service/employee/{employeeId}                   getReservationByEmployeeId             path employeeId               List`<Reservation>`{=html}

  Reservas         GET         /reservation-service/customer/{customerId}                   getReservationByCustomerId             path customerId               List`<Reservation>`{=html}

  Reservas         GET         /reservation-service/barber/{barberId}                       getReservationByBarberId               path barberId                 List`<Reservation>`{=html}

  Reservas         PATCH       /reservation-service/{id}/confirm                            confirmReservation                     path id                       Reservation

  Reservas         PATCH       /reservation-service/{id}/cancel                             cancelReservation                      path id                       Reservation

  Suscripciones    POST        /subscription-service/create-subscription                    createSubscription                     SubscriptionRqDto             SubscriptionRsDto
  catálogo                                                                                                                                                       

  Suscripciones    GET         /subscription-service/all                                    getAllSubscription                     ---                           List`<SubscriptionRsDto>`{=html}
  catálogo                                                                                                                                                       

  Suscripciones    GET         /subscription-service/id/{id}                                getSubscription                        path id                       SubscriptionRsDto
  catálogo                                                                                                                                                       

  Suscripción      POST        /subscription-barbershop-service/create                      createSubscriptionForBarber            SubscriptionBarbershopRqDto   SubscriptionBarbershopRsDto
  barbería                                                                                                                                                       

  Suscripción      PUT         /subscription-barbershop-service/renew                       renewSubscriptionForBarber             SubscriptionBarbershopRqDto   SubscriptionBarbershopRsDto
  barbería                                                                                                                                                       

  Cola virtual     POST        /api/v1/queue/{employeeId}/open                              openQueue                              path employeeId               Map/message

  Cola virtual     POST        /api/v1/queue/{employeeId}/close                             closeQueue                             path employeeId               Map/message

  Cola virtual     POST        /api/v1/queue/{employeeId}/next                              nextCustomer                           path employeeId               Reservation

  Cola virtual     POST        /api/v1/queue/{employeeId}/complete                          completeCurrentTurn                    path employeeId               Reservation

  Cola virtual     POST        /api/v1/queue/join                                           joinQueue                              ReservationCommand            Reservation

  Cola virtual     GET         /api/v1/queue/{employeeId}                                   getQueue                               path employeeId               QueueSnapshot
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## 6. Requests y Responses (DTOs)

Los DTO HTTP están en `infrastructure/entrypoint/reactiveweb/dto`.

### `UserRqDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/User/UserRqDto.java`

  Campo      Tipo
  ---------- ---------
  `roleId`   `Short`

### `UserRsDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/User/UserRsDto.java`

  Campo          Tipo
  -------------- --------------
  `id`           `UUID`
  `firebaseId`   `String`
  `status`       `UserStatus`
  `createAt`     `Instant`
  `updateAt`     `Instant`
  `roleId`       `Short`

### `AuthorizationRsDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/authorization/AuthorizationRsDto.java`

  Campo          Tipo
  -------------- -------------------------------
  `role`         `RoleType`
  `userId`       `UUID`
  `employeeId`   `UUID`
  `barbershop`   `BarbershopSubscriptionRsDto`
  `customerId`   `UUID`

### `BarbershopOnBoardingRqDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/barbershop/BarbershopOnBoardingRqDto.java`

  Campo            Tipo
  ---------------- ---------------------------
  `name`           `String`
  `description`    `String`
  `location`       `String`
  `phone`          `String`
  `document`       `String`
  `documentType`   `DocumentType`
  `companyName`    `String`
  `employee`       `EmployeeOnboardingRqDto`

### `BarbershopOnBoardingRsDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/barbershop/BarbershopOnBoardingRsDto.java`

  Campo            Tipo
  ---------------- ---------------------------
  `name`           `String`
  `description`    `String`
  `location`       `String`
  `phone`          `String`
  `document`       `String`
  `documentType`   `DocumentType`
  `companyName`    `String`
  `employee`       `EmployeeOnboardingRsDto`

### `BarbershopRqDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/barbershop/BarbershopRqDto.java`

  Campo            Tipo
  ---------------- ----------------
  `name`           `String`
  `description`    `String`
  `location`       `String`
  `phone`          `String`
  `document`       `String`
  `documentType`   `DocumentType`
  `companyName`    `String`

### `BarbershopRsDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/barbershop/BarbershopRsDto.java`

  Campo            Tipo
  ---------------- ----------------
  `id`             `UUID`
  `name`           `String`
  `description`    `String`
  `location`       `String`
  `phone`          `String`
  `document`       `String`
  `documentType`   `DocumentType`
  `companyName`    `String`
  `status`         `String`
  `createAt`       `Instant`
  `updateAt`       `Instant`

### `BarbershopSubscriptionRsDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/barbershop/BarbershopSubscriptionRsDto.java`

  Campo            Tipo
  ---------------- -----------------------------------
  `id`             `UUID`
  `name`           `String`
  `location`       `String`
  `phone`          `String`
  `subscription`   `SubscriptionBarbershopAuthRsDto`

### `CustomerOnboardingRqDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/customer/CustomerOnboardingRqDto.java`

  Campo            Tipo
  ---------------- ----------------
  `user`           `UserRqDto`
  `name`           `String`
  `document`       `String`
  `documentType`   `DocumentType`
  `cell`           `String`
  `email`          `String`

### `CustomerOnboardingRsDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/customer/CustomerOnboardingRsDto.java`

  Campo            Tipo
  ---------------- ----------------
  `id`             `UUID`
  `user`           `UserRsDto`
  `document`       `String`
  `documentType`   `DocumentType`
  `name`           `String`
  `cell`           `String`
  `email`          `String`
  `createAt`       `Instant`
  `updateAt`       `Instant`

### `CustomerRqDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/customer/CustomerRqDto.java`

  Campo            Tipo
  ---------------- ----------------
  `userId`         `UUID`
  `name`           `String`
  `document`       `String`
  `documentType`   `DocumentType`
  `cell`           `String`
  `email`          `String`

### `CustomerRsDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/customer/CustomerRsDto.java`

  Campo            Tipo
  ---------------- ----------------
  `id`             `UUID`
  `userId`         `UUID`
  `document`       `String`
  `documentType`   `DocumentType`
  `name`           `String`
  `cell`           `String`
  `email`          `String`
  `createAt`       `Instant`
  `updateAt`       `Instant`

### `EmployeeOnboardingRqDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/employee/EmployeeOnboardingRqDto.java`

  Campo            Tipo
  ---------------- ----------------
  `user`           `UserRqDto`
  `barberiaId`     `UUID`
  `name`           `String`
  `document`       `String`
  `documentType`   `DocumentType`
  `cell`           `String`
  `email`          `String`
  `specialty`      `String`

### `EmployeeOnboardingRsDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/employee/EmployeeOnboardingRsDto.java`

  Campo            Tipo
  ---------------- ----------------
  `id`             `UUID`
  `name`           `String`
  `document`       `String`
  `documentType`   `DocumentType`
  `cell`           `String`
  `email`          `String`
  `specialty`      `String`
  `user`           `UserRsDto`
  `createAt`       `Instant`

### `EmployeeRqDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/employee/EmployeeRqDto.java`

  Campo            Tipo
  ---------------- ----------------
  `barberiaId`     `UUID`
  `name`           `String`
  `document`       `String`
  `documentType`   `DocumentType`
  `cell`           `String`
  `email`          `String`
  `specialty`      `String`
  `userId`         `UUID`

### `EmployeeRsDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/employee/EmployeeRsDto.java`

  Campo            Tipo
  ---------------- ----------------
  `id`             `UUID`
  `userId`         `UUID`
  `barberiaId`     `UUID`
  `document`       `String`
  `documentType`   `DocumentType`
  `name`           `String`
  `cell`           `String`
  `email`          `String`
  `specialty`      `String`
  `createAt`       `Instant`
  `updateAt`       `Instant`

### `ErrorRsDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/error/ErrorRsDto.java`

  Campo       Tipo
  ----------- -----------
  `reason`    `String`
  `code`      `String`
  `message`   `String`
  `date`      `Instant`

### `NotificationRqDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/notification/NotificationRqDto.java`

  Campo             Tipo
  ----------------- -----------
  `customerId`      `UUID`
  `reservationId`   `UUID`
  `title`           `String`
  `content`         `String`
  `channelType`     `String`
  `eventType`       `String`
  `status`          `String`
  `retries`         `Integer`
  `messageError`    `String`
  `scheduledDate`   `Instant`
  `dateSent`        `Instant`

### `NotificationRsDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/notification/NotificationRsDto.java`

  Campo             Tipo
  ----------------- -----------
  `id`              `UUID`
  `customerId`      `UUID`
  `reservationId`   `UUID`
  `title`           `String`
  `content`         `String`
  `channelType`     `String`
  `eventType`       `String`
  `status`          `String`
  `retries`         `Integer`
  `messageError`    `String`
  `scheduledDate`   `Instant`
  `dateSent`        `Instant`
  `createAt`        `Instant`

### `ReservationReviewRqDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/reservationreview/ReservationReviewRqDto.java`

  Campo             Tipo
  ----------------- -----------
  `reservationId`   `UUID`
  `qualification`   `Integer`
  `comment`         `String`

### `ReservationReviewRsDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/reservationreview/ReservationReviewRsDto.java`

  Campo             Tipo
  ----------------- -----------
  `id`              `Integer`
  `reservationId`   `UUID`
  `qualification`   `Integer`
  `comment`         `String`
  `createAt`        `Instant`
  `updateAt`        `Instant`

### `RoleRqDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/role/RoleRqDto.java`

  Campo        Tipo
  ------------ ------------
  `roleType`   `RoleType`

### `RoleRsDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/role/RoleRsDto.java`

  Campo        Tipo
  ------------ ------------
  `id`         `Short`
  `roleType`   `RoleType`
  `status`     `String`

### `ScheduleRqDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/schedule/ScheduleRqDto.java`

  Campo              Tipo
  ------------------ -------------
  `empleadoId`       `UUID`
  `startTime`        `LocalTime`
  `endTime`          `LocalTime`
  `lunchStartTime`   `LocalTime`
  `lunchEndTime`     `LocalTime`
  `vacation`         `Boolean`

### `ScheduleRsDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/schedule/ScheduleRsDto.java`

  Campo              Tipo
  ------------------ -------------
  `id`               `Integer`
  `empleadoId`       `UUID`
  `startTime`        `LocalTime`
  `endTime`          `LocalTime`
  `lunchStartTime`   `LocalTime`
  `lunchEndTime`     `LocalTime`
  `vacation`         `Boolean`

### `ServiceRqDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/service/ServiceRqDto.java`

  Campo             Tipo
  ----------------- -----------
  `barberiaId`      `UUID`
  `name`            `String`
  `description`     `String`
  `duration`        `Integer`
  `price`           `Integer`
  `offert`          `Boolean`
  `special_price`   `Integer`

### `ServiceRsDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/service/ServiceRsDto.java`

  Campo             Tipo
  ----------------- -----------
  `id`              `Integer`
  `barberiaId`      `UUID`
  `name`            `String`
  `description`     `String`
  `duration`        `Integer`
  `status`          `Boolean`
  `offert`          `Boolean`
  `price`           `Integer`
  `special_price`   `Integer`
  `createAt`        `Instant`
  `updateAt`        `Instant`

### `SubscriptionRqDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/subscription/SubscriptionRqDto.java`

  Campo           Tipo
  --------------- -----------
  `name`          `String`
  `description`   `String`
  `price`         `Integer`
  `discount`      `Byte`

### `SubscriptionRsDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/subscription/SubscriptionRsDto.java`

  Campo           Tipo
  --------------- --------------
  `id`            `Integer`
  `name`          `String`
  `description`   `String`
  `price`         `BigInteger`
  `discount`      `Byte`
  `createAt`      `Instant`
  `updateAt`      `Instant`

### `SubscriptionBarbershopAuthRsDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/subscriptionbarber/SubscriptionBarbershopAuthRsDto.java`

  Campo      Tipo
  ---------- ----------------------------
  `status`   `SubscriptionBarberStatus`

### `SubscriptionBarbershopRqDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/subscriptionbarber/SubscriptionBarbershopRqDto.java`

  Campo              Tipo
  ------------------ ----------------------------
  `barberId`         `UUID`
  `subscriptionId`   `Integer`
  `status`           `SubscriptionBarberStatus`
  `duration`         `Integer`
  `type`             `SubscriptionType`
  `automaticRenew`   `Boolean`

### `SubscriptionBarbershopRsDto`

Ruta fuente:
`src/main/java/com/smartbarber/infrastructure/entrypoint/reactiveweb/dto/subscriptionbarber/SubscriptionBarbershopRsDto.java`

  Campo                    Tipo
  ------------------------ ----------------------------
  `id`                     `UUID`
  `barberId`               `UUID`
  `subscriptionId`         `Integer`
  `status`                 `SubscriptionBarberStatus`
  `duration`               `Integer`
  `subscriptionPrice`      `BigInteger`
  `subscriptionDiscount`   `Byte`
  `orderId`                `UUID`
  `createdAt`              `Instant`
  `updatedAt`              `Instant`
  `startDate`              `Instant`
  `expirationDate`         `Instant`

## 7. Domain Models

### `Authentication` --- `src/main/java/com/smartbarber/domain/model/Authentication.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `VirtualQueue` --- `src/main/java/com/smartbarber/domain/model/VirtualQueue.java`

  Campo    Tipo
  -------- -----------
  `open`   `boolean`

### `BarberShopOnboarding` --- `src/main/java/com/smartbarber/domain/model/barbershop/BarberShopOnboarding.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `Barbershop` --- `src/main/java/com/smartbarber/domain/model/barbershop/Barbershop.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `BarbershopResponse` --- `src/main/java/com/smartbarber/domain/model/barbershop/BarbershopResponse.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `Customer` --- `src/main/java/com/smartbarber/domain/model/customer/Customer.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `CustomerOnboarding` --- `src/main/java/com/smartbarber/domain/model/customer/CustomerOnboarding.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `CustomerResponse` --- `src/main/java/com/smartbarber/domain/model/customer/CustomerResponse.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `Employee` --- `src/main/java/com/smartbarber/domain/model/employee/Employee.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `EmployeeOnbording` --- `src/main/java/com/smartbarber/domain/model/employee/EmployeeOnbording.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `Notification` --- `src/main/java/com/smartbarber/domain/model/notification/Notification.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `QueueSnapshot` --- `src/main/java/com/smartbarber/domain/model/queue/QueueSnapshot.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `QueueReservation` --- `src/main/java/com/smartbarber/domain/model/queue/event/QueueReservation.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `UserEvent` --- `src/main/java/com/smartbarber/domain/model/queue/event/UserEvent.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `VirtualQueue` --- `src/main/java/com/smartbarber/domain/model/queue/event/VirtualQueue.java`

  Campo    Tipo
  -------- -----------
  `open`   `boolean`

### `Reservation` --- `src/main/java/com/smartbarber/domain/model/reservation/Reservation.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `ReservationResponse` --- `src/main/java/com/smartbarber/domain/model/reservation/ReservationResponse.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `ServiceReservation` --- `src/main/java/com/smartbarber/domain/model/reservation/ServiceReservation.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `ServiceReservationResponse` --- `src/main/java/com/smartbarber/domain/model/reservation/ServiceReservationResponse.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `ReservationReview` --- `src/main/java/com/smartbarber/domain/model/reservationreview/ReservationReview.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `Role` --- `src/main/java/com/smartbarber/domain/model/role/Role.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `Schedule` --- `src/main/java/com/smartbarber/domain/model/schedule/Schedule.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `Service` --- `src/main/java/com/smartbarber/domain/model/service/Service.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `SubscriptionBarbershop` --- `src/main/java/com/smartbarber/domain/model/subscriptionbarber/SubscriptionBarbershop.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `SubscriptionBarbershopResponse` --- `src/main/java/com/smartbarber/domain/model/subscriptionbarber/SubscriptionBarbershopResponse.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `Subscription` --- `src/main/java/com/smartbarber/domain/model/suscription/Subscription.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `Transaction` --- `src/main/java/com/smartbarber/domain/model/transaction/Transaction.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

### `User` --- `src/main/java/com/smartbarber/domain/model/user/User.java`

*No se pudo inferir una lista de campos simple; revisar la clase
fuente.*

## 8. Enums

-   `DocumentType`: `CC`, `CE`, `NIT`
-   `ReservationStatus`: `PENDING`, `CONFIRMED`, `IN_PROGRESS`,
    `COMPLETED`, `CANCELLED`, `WAITING`, `NO_SHOW`
-   `ReservationType`: `VIRTUAL_QUEUE`, `SERVICE_RESERVATION`
-   `RoleType`:
-   `ServiceReservationStatus`: `COMPLETED`, `ACTIVE`, `CANCEL`
-   `SubscriptionBarberStatus`: `ACTIVE`, `APPROVED`, `PENDING`,
    `DECLINED`, `NOT_SUBSCRIPTION`, `EXPIRED`, `REFUNDED`
-   `SubscriptionType`: `CREATE`, `RENEW`, `EXPIRED`
-   `TransactionStatus`: `PENDING`, `APPROVED`, `REJECTED`, `CANCELED`,
    `REFUNDED`
-   `TransactionType`: `BOOKING_TRANSACTION`, `SUBSCRIPTION_TRANSACTION`
-   `UserStatus`: `ACTIVE`, `BLOCKED`, `PENDING`

## 9. Use Cases

-   `AuthenticationUC` ---
    `src/main/java/com/smartbarber/application/usecase/athentication/AuthenticationUC.java`
-   `BarbershopUpdateUC` ---
    `src/main/java/com/smartbarber/application/usecase/barbershop/BarbershopUpdateUC.java`
-   `CreateBarbershopUC` ---
    `src/main/java/com/smartbarber/application/usecase/barbershop/CreateBarbershopUC.java`
-   `FindBarbershopUC` ---
    `src/main/java/com/smartbarber/application/usecase/barbershop/FindBarbershopUC.java`
-   `OnboardingBarberShopUc` ---
    `src/main/java/com/smartbarber/application/usecase/barbershop/OnboardingBarberShopUc.java`
-   `CreateCustomerUC` ---
    `src/main/java/com/smartbarber/application/usecase/customer/CreateCustomerUC.java`
-   `SearchCustomerUC` ---
    `src/main/java/com/smartbarber/application/usecase/customer/SearchCustomerUC.java`
-   `UpdateCustomerUC` ---
    `src/main/java/com/smartbarber/application/usecase/customer/UpdateCustomerUC.java`
-   `CreateEmployeeUC` ---
    `src/main/java/com/smartbarber/application/usecase/employee/CreateEmployeeUC.java`
-   `SearchEmployeeUC` ---
    `src/main/java/com/smartbarber/application/usecase/employee/SearchEmployeeUC.java`
-   `UpdateEmployeeUC` ---
    `src/main/java/com/smartbarber/application/usecase/employee/UpdateEmployeeUC.java`
-   `CreateNotificationUC` ---
    `src/main/java/com/smartbarber/application/usecase/notification/CreateNotificationUC.java`
-   `SearchNotificationUC` ---
    `src/main/java/com/smartbarber/application/usecase/notification/SearchNotificationUC.java`
-   `UpdateNotificationUC` ---
    `src/main/java/com/smartbarber/application/usecase/notification/UpdateNotificationUC.java`
-   `CloseQueueUC` ---
    `src/main/java/com/smartbarber/application/usecase/queue/CloseQueueUC.java`
-   `CompleteCurrentTurnUC` ---
    `src/main/java/com/smartbarber/application/usecase/queue/CompleteCurrentTurnUC.java`
-   `JoinQueueUC` ---
    `src/main/java/com/smartbarber/application/usecase/queue/JoinQueueUC.java`
-   `NextCustomerUC` ---
    `src/main/java/com/smartbarber/application/usecase/queue/NextCustomerUC.java`
-   `OpenQueueUC` ---
    `src/main/java/com/smartbarber/application/usecase/queue/OpenQueueUC.java`
-   `QueueAvailabilityService` ---
    `src/main/java/com/smartbarber/application/usecase/queue/QueueAvailabilityService.java`
-   `QueueBroadcastService` ---
    `src/main/java/com/smartbarber/application/usecase/queue/QueueBroadcastService.java`
-   `SubscribeQueueUC` ---
    `src/main/java/com/smartbarber/application/usecase/queue/SubscribeQueueUC.java`
-   `ChangeReservationStatusUc` ---
    `src/main/java/com/smartbarber/application/usecase/reservation/servicereservation/ChangeReservationStatusUc.java`
-   `CreateReservationQueueUc` ---
    `src/main/java/com/smartbarber/application/usecase/reservation/servicereservation/CreateReservationQueueUc.java`
-   `CreateReservationUc` ---
    `src/main/java/com/smartbarber/application/usecase/reservation/servicereservation/CreateReservationUc.java`
-   `FindReservationUc` ---
    `src/main/java/com/smartbarber/application/usecase/reservation/servicereservation/FindReservationUc.java`
-   `CreateReservationReviewUC` ---
    `src/main/java/com/smartbarber/application/usecase/reservationreview/CreateReservationReviewUC.java`
-   `SearchReservationReviewUC` ---
    `src/main/java/com/smartbarber/application/usecase/reservationreview/SearchReservationReviewUC.java`
-   `UpdateReservationReviewUC` ---
    `src/main/java/com/smartbarber/application/usecase/reservationreview/UpdateReservationReviewUC.java`
-   `CreateRoleUC` ---
    `src/main/java/com/smartbarber/application/usecase/role/CreateRoleUC.java`
-   `RoleUpdateUC` ---
    `src/main/java/com/smartbarber/application/usecase/role/RoleUpdateUC.java`
-   `SearchRoleUC` ---
    `src/main/java/com/smartbarber/application/usecase/role/SearchRoleUC.java`
-   `CreateScheduleUC` ---
    `src/main/java/com/smartbarber/application/usecase/schedule/CreateScheduleUC.java`
-   `SearchScheduleUC` ---
    `src/main/java/com/smartbarber/application/usecase/schedule/SearchScheduleUC.java`
-   `UpdateScheduleUC` ---
    `src/main/java/com/smartbarber/application/usecase/schedule/UpdateScheduleUC.java`
-   `CreateServiceUC` ---
    `src/main/java/com/smartbarber/application/usecase/service/CreateServiceUC.java`
-   `SearchServiceUC` ---
    `src/main/java/com/smartbarber/application/usecase/service/SearchServiceUC.java`
-   `UpdateServiceUC` ---
    `src/main/java/com/smartbarber/application/usecase/service/UpdateServiceUC.java`
-   `CreateSubscriptionUC` ---
    `src/main/java/com/smartbarber/application/usecase/subscription/CreateSubscriptionUC.java`
-   `FindSubscriptionUC` ---
    `src/main/java/com/smartbarber/application/usecase/subscription/FindSubscriptionUC.java`
-   `CreateSubscriptionBarberUC` ---
    `src/main/java/com/smartbarber/application/usecase/subscriptionbarber/CreateSubscriptionBarberUC.java`
-   `ExecuteSubscriptionBarberUC` ---
    `src/main/java/com/smartbarber/application/usecase/subscriptionbarber/ExecuteSubscriptionBarberUC.java`
-   `ExpiredSubscriptionUc` ---
    `src/main/java/com/smartbarber/application/usecase/subscriptionbarber/ExpiredSubscriptionUc.java`
-   `FindSubscriptionBarberUC` ---
    `src/main/java/com/smartbarber/application/usecase/subscriptionbarber/FindSubscriptionBarberUC.java`
-   `RenewSubscriptionUC` ---
    `src/main/java/com/smartbarber/application/usecase/subscriptionbarber/RenewSubscriptionUC.java`
-   `SendMessageUC` ---
    `src/main/java/com/smartbarber/application/usecase/subscriptionbarber/SendMessageUC.java`
-   `UpdateSubscriptionBarberStatusUC` ---
    `src/main/java/com/smartbarber/application/usecase/subscriptionbarber/UpdateSubscriptionBarberStatusUC.java`
-   `CreateTransactionUC` ---
    `src/main/java/com/smartbarber/application/usecase/transaction/CreateTransactionUC.java`
-   `FindTransactionUc` ---
    `src/main/java/com/smartbarber/application/usecase/transaction/FindTransactionUc.java`
-   `UpdateTransactionUC` ---
    `src/main/java/com/smartbarber/application/usecase/transaction/UpdateTransactionUC.java`
-   `WaitMessageResponseUC` ---
    `src/main/java/com/smartbarber/application/usecase/transaction/WaitMessageResponseUC.java`
-   `CreateUserUC` ---
    `src/main/java/com/smartbarber/application/usecase/user/CreateUserUC.java`
-   `SearchUserUC` ---
    `src/main/java/com/smartbarber/application/usecase/user/SearchUserUC.java`
-   `UpdateUserUC` ---
    `src/main/java/com/smartbarber/application/usecase/user/UpdateUserUC.java`

### Organización funcional

-   **athentication:** `AuthenticationUC`
-   **barbershop:** `BarbershopUpdateUC`, `CreateBarbershopUC`,
    `FindBarbershopUC`, `OnboardingBarberShopUc`
-   **customer:** `CreateCustomerUC`, `SearchCustomerUC`,
    `UpdateCustomerUC`
-   **employee:** `CreateEmployeeUC`, `SearchEmployeeUC`,
    `UpdateEmployeeUC`
-   **notification:** `CreateNotificationUC`, `SearchNotificationUC`,
    `UpdateNotificationUC`
-   **queue:** `CloseQueueUC`, `CompleteCurrentTurnUC`, `JoinQueueUC`,
    `NextCustomerUC`, `OpenQueueUC`, `QueueAvailabilityService`,
    `QueueBroadcastService`, `SubscribeQueueUC`
-   **reservation/servicereservation:** `ChangeReservationStatusUc`,
    `CreateReservationQueueUc`, `CreateReservationUc`,
    `FindReservationUc`
-   **reservationreview:** `CreateReservationReviewUC`,
    `SearchReservationReviewUC`, `UpdateReservationReviewUC`
-   **role:** `CreateRoleUC`, `RoleUpdateUC`, `SearchRoleUC`
-   **schedule:** `CreateScheduleUC`, `SearchScheduleUC`,
    `UpdateScheduleUC`
-   **service:** `CreateServiceUC`, `SearchServiceUC`, `UpdateServiceUC`
-   **subscription:** `CreateSubscriptionUC`, `FindSubscriptionUC`
-   **subscriptionbarber:** `CreateSubscriptionBarberUC`,
    `ExecuteSubscriptionBarberUC`, `ExpiredSubscriptionUc`,
    `FindSubscriptionBarberUC`, `RenewSubscriptionUC`, `SendMessageUC`,
    `UpdateSubscriptionBarberStatusUC`
-   **transaction:** `CreateTransactionUC`, `FindTransactionUc`,
    `UpdateTransactionUC`, `WaitMessageResponseUC`
-   **user:** `CreateUserUC`, `SearchUserUC`, `UpdateUserUC`

## 10. Ports

### `BarberShopRepositoryPort` --- `src/main/java/com/smartbarber/domain/port/BarberShopRepositoryPort.java`

-   `findById(UUID id)`
-   `findByName(String name)`
-   `findByCompanyName(String companyName)`
-   `findByDocument(String document)`
-   `findAll()`
-   `save(Barbershop barbershop)`
-   `update(UUID id, Barbershop barbershop)`
-   `deleteBarbershop(UUID id)`
-   `existByName(String name)`
-   `existByCompanyName(String companyName)`
-   `existByDocument(String document)`

### `BarberShopRepositoryPort` --- `src/main/java/com/smartbarber/domain/port/BarberShopRepositoryPort.java`

-   `findById(UUID id)`
-   `findByName(String name)`
-   `findByCompanyName(String companyName)`
-   `findByDocument(String document)`
-   `findAll()`
-   `save(Barbershop barbershop)`
-   `update(UUID id, Barbershop barbershop)`
-   `deleteBarbershop(UUID id)`
-   `existByName(String name)`
-   `existByCompanyName(String companyName)`
-   `existByDocument(String document)`

### `CustomerPort` --- `src/main/java/com/smartbarber/domain/port/CustomerPort.java`

-   `findById(UUID id)`
-   `findByName(String name)`
-   `findByDocument(String document)`
-   `save(Customer customer)`
-   `update(UUID id, Customer customer)`
-   `eliminarCliente(UUID id)`
-   `existsByDocument(String document)`
-   `findByUserId(UUID userId)`

### `CustomerPort` --- `src/main/java/com/smartbarber/domain/port/CustomerPort.java`

-   `findById(UUID id)`
-   `findByName(String name)`
-   `findByDocument(String document)`
-   `save(Customer customer)`
-   `update(UUID id, Customer customer)`
-   `eliminarCliente(UUID id)`
-   `existsByDocument(String document)`
-   `findByUserId(UUID userId)`

### `EmployeePort` --- `src/main/java/com/smartbarber/domain/port/EmployeePort.java`

-   `findById(UUID id)`
-   `findByName(String name)`
-   `findByDocument(String document)`
-   `findByUserId(UUID userId)`
-   `save(Employee employee)`
-   `update(UUID id, Employee employee)`
-   `eliminarEmpleado(UUID id)`
-   `existsByDocument(String document)`

### `EmployeePort` --- `src/main/java/com/smartbarber/domain/port/EmployeePort.java`

-   `findById(UUID id)`
-   `findByName(String name)`
-   `findByDocument(String document)`
-   `findByUserId(UUID userId)`
-   `save(Employee employee)`
-   `update(UUID id, Employee employee)`
-   `eliminarEmpleado(UUID id)`
-   `existsByDocument(String document)`

### `FirebaseAuthPort` --- `src/main/java/com/smartbarber/domain/port/FirebaseAuthPort.java`

-   `isValidToken(String idToken)`
-   `isExpiredToken(String idToken)`
-   `getUid(String idToken)`

### `FirebaseAuthPort` --- `src/main/java/com/smartbarber/domain/port/FirebaseAuthPort.java`

-   `isValidToken(String idToken)`
-   `isExpiredToken(String idToken)`
-   `getUid(String idToken)`

### `NotificationPort` --- `src/main/java/com/smartbarber/domain/port/NotificationPort.java`

-   `findById(UUID id)`
-   `save(Notification notification)`
-   `update(UUID id, Notification notification)`
-   `findByIdCustomer(UUID customerId)`
-   `findByIdReservation(UUID reservationId)`
-   `existByTitleAndContent(String title, String content)`

### `NotificationPort` --- `src/main/java/com/smartbarber/domain/port/NotificationPort.java`

-   `findById(UUID id)`
-   `save(Notification notification)`
-   `update(UUID id, Notification notification)`
-   `findByIdCustomer(UUID customerId)`
-   `findByIdReservation(UUID reservationId)`
-   `existByTitleAndContent(String title, String content)`

### `ReservationReviewPort` --- `src/main/java/com/smartbarber/domain/port/ReservationReviewPort.java`

-   `findById(Integer id)`
-   `findByReservationId(UUID reservationId)`
-   `save(ReservationReview reservationReview)`
-   `update(Integer id,             ReservationReview reservationReview)`
-   `existsByReservationId(UUID reservationId)`

### `ReservationReviewPort` --- `src/main/java/com/smartbarber/domain/port/ReservationReviewPort.java`

-   `findById(Integer id)`
-   `findByReservationId(UUID reservationId)`
-   `save(ReservationReview reservationReview)`
-   `update(Integer id,             ReservationReview reservationReview)`
-   `existsByReservationId(UUID reservationId)`

### `RolePort` --- `src/main/java/com/smartbarber/domain/port/RolePort.java`

-   `findById(Short id)`
-   `save(Role role)`
-   `update(Short id, Role role)`
-   `existsByRoleType(RoleType roleType)`

### `RolePort` --- `src/main/java/com/smartbarber/domain/port/RolePort.java`

-   `findById(Short id)`
-   `save(Role role)`
-   `update(Short id, Role role)`
-   `existsByRoleType(RoleType roleType)`

### `SchedulePort` --- `src/main/java/com/smartbarber/domain/port/SchedulePort.java`

-   `findById(Integer id)`
-   `findByIdEmployee(UUID empleadoId)`
-   `save(Schedule schedule)`
-   `update(Integer id, Schedule schedule)`
-   `existByIdEmployee(UUID empleadoId)`

### `SchedulePort` --- `src/main/java/com/smartbarber/domain/port/SchedulePort.java`

-   `findById(Integer id)`
-   `findByIdEmployee(UUID empleadoId)`
-   `save(Schedule schedule)`
-   `update(Integer id, Schedule schedule)`
-   `existByIdEmployee(UUID empleadoId)`

### `ServicePort` --- `src/main/java/com/smartbarber/domain/port/ServicePort.java`

-   `findById(Integer id)`
-   `findByName(String name)`
-   `save(Service service)`
-   `update(Integer id, Service service)`
-   `existByNameAndDescription(String name, String description)`
-   `findByBarberiaId(UUID barberiaId)`

### `ServicePort` --- `src/main/java/com/smartbarber/domain/port/ServicePort.java`

-   `findById(Integer id)`
-   `findByName(String name)`
-   `save(Service service)`
-   `update(Integer id, Service service)`
-   `existByNameAndDescription(String name, String description)`
-   `findByBarberiaId(UUID barberiaId)`

### `UserPort` --- `src/main/java/com/smartbarber/domain/port/UserPort.java`

-   `findById(UUID id)`
-   `save(User user)`
-   `update(UUID id, User user)`
-   `eliminarUsuario(UUID id)`
-   `existByFirebaseId(String firebaseId)`
-   `findByFirebaseId(String firebaseId)`

### `UserPort` --- `src/main/java/com/smartbarber/domain/port/UserPort.java`

-   `findById(UUID id)`
-   `save(User user)`
-   `update(UUID id, User user)`
-   `eliminarUsuario(UUID id)`
-   `existByFirebaseId(String firebaseId)`
-   `findByFirebaseId(String firebaseId)`

### `MessageNotificationPort` --- `src/main/java/com/smartbarber/domain/port/event/MessageNotificationPort.java`

### `MessageResponsePort` --- `src/main/java/com/smartbarber/domain/port/event/MessageResponsePort.java`

-   `waitForResponse(UUID orderId)`

### `BarberQueuePort` --- `src/main/java/com/smartbarber/domain/port/queue/BarberQueuePort.java`

-   `findByEmployeeId(UUID employeeId)`
-   `findByEmployeeIdForUpdate(UUID employeeId)`
-   `save(BarberQueueEntity queue)`
-   `ensureExists(UUID employeeId,             UUID barbershopId)`
-   `updateAcceptingClients(UUID employeeId,             boolean acceptingClients)`

### `QueueManagementPort` --- `src/main/java/com/smartbarber/domain/port/queue/QueueManagementPort.java`

-   `open(String barberShopId)`
-   `close(String barberShopId)`
-   `enqueue(String barberShopId,             String reservationId)`
-   `nextReservation(String barberShopId)`

### `QueuePort` --- `src/main/java/com/smartbarber/domain/port/queue/QueuePort.java`

-   `open(String barberShopId)`
-   `close(String barberShopId)`
-   `enqueue(String barberShopId,             QueueReservation reservation)`
-   `nextReservation(String barberShopId)`
-   `findReservations(String barberShopId)`

### `QueueSubscriptionPort` --- `src/main/java/com/smartbarber/domain/port/queue/QueueSubscriptionPort.java`

-   `subscribe(String barberShopId)`

### `UserEventPublisherPort` --- `src/main/java/com/smartbarber/domain/port/queue/UserEventPublisherPort.java`

-   `publish(String userId,             UserEvent event)`
-   `subscribe(String userId)`

### `ReservationRepositoryPort` --- `src/main/java/com/smartbarber/domain/port/reservation/ReservationRepositoryPort.java`

-   `findById(UUID id)`
-   `existsById(UUID id)`
-   `findByEmployeeId(UUID employeeId)`
-   `findByCustomerId(UUID customerId)`
-   `findAllBarberId(UUID barberId)`
-   `save(Reservation reservation)`
-   `existsByEmployeeAndRange(UUID employeeId,             OffsetDateTime startTime,             OffsetDateTime endTime)`
-   `existsByCustomerAndRange(UUID customerId,             OffsetDateTime startTime,             OffsetDateTime endTime)`
-   `findWaitingQueueByEmployeeId(UUID employeeId)`
-   `findCurrentQueueTurn(UUID employeeId)`
-   `countPreviousWaitingTurns(UUID employeeId,             OffsetDateTime entryTime,             UUID reservationId)`
-   `findNextScheduledReservationStart(UUID employeeId,             OffsetDateTime from)`
-   `calculateRemainingQueueDuration(UUID employeeId,             OffsetDateTime currentTime)`

### `ServiceReservationPort` --- `src/main/java/com/smartbarber/domain/port/reservation/ServiceReservationPort.java`

-   `save(ServiceReservation serviceReservation)`
-   `findById(UUID id)`
-   `findByReservationId(UUID reservationId)`
-   `existsByReservationIdAndServiceId(UUID reservationId, Integer serviceId)`

### `SubscriptionRepositoryPort` --- `src/main/java/com/smartbarber/domain/port/subscription/SubscriptionRepositoryPort.java`

-   `save(Subscription subscription)`
-   `findById(Integer id)`
-   `findAll()`

### `SubscriptionBarbershopRepositoryPort` --- `src/main/java/com/smartbarber/domain/port/subscriptionbarbershop/SubscriptionBarbershopRepositoryPort.java`

-   `findByBarberId(UUID barberId)`
-   `findByBarberIdAndStatus(UUID barberId, SubscriptionBarberStatus status)`
-   `findById(UUID subscriptionId)`
-   `findByExpirationDate(Instant expirationDate)`
-   `save(SubscriptionBarbershop subscriptionBarbershop)`
-   `countByBarberIdAndStatusIn(UUID barberId)`
-   `existsSubscriptionsPendingOrApproved(UUID barberId)`
-   `countActiveSubscriptionsByBarberId(UUID barberId)`
-   `findByStatusAndAutomaticRenew(Instant initialDate, Instant finalDate,                                                                Boolean automaticRenew)`

### `TransactionRepositoryPort` --- `src/main/java/com/smartbarber/domain/port/transaction/TransactionRepositoryPort.java`

-   `save(Transaction transaction)`
-   `findById(UUID transactionId)`
-   `findByOrderId(UUID orderId)`
-   `findByReservationId(UUID reservationId)`
-   `findBySubscriptionBarberId(UUID subscriptionBarberId)`
-   `existsByOrderId(UUID orderId)`

## 11. PostgreSQL / R2DBC

La persistencia está organizada en:

``` text
domain port
   ↓
Postgres Adapter
   ↓
R2DBC Data/Repository
   ↓
Entity
   ↓
PostgreSQL
```

Entidades detectadas: - `BarberQueueEntity` - `BarbershopEntity` -
`CustomerEntity` - `EmployeeEntity` - `NotificationEntity` -
`ReservationEntity` - `ReservationReviewEntity` - `RoleEntity` -
`ScheduleEntity` - `ServiceEntity` - `ServiceReservationEntity` -
`SubscriptionBarbershopEntity` - `SubscriptionEntity` -
`TransactionEntity` - `UserEntity`

Data repositories detectados: - `BarberQueueData` - `BarbershopData` -
`CustomerData` - `EmployeeData` - `NotificationData` -
`ReservationData` - `ReservationReviewData` - `RoleData` -
`ScheduleData` - `ServiceData` - `ServiceReservationData` -
`SubscriptionBarbershopData` - `SubscriptionData` - `TransactionData` -
`UserData`

Adapters detectados: - `BarberQueueAdapter` - `BarbershopAdapter` -
`CustomerAdapter` - `EmployeeAdapter` - `NotificationAdapter` -
`ReservationAdapter` - `ReservationReviewAdapter` - `RoleAdapter` -
`ScheduleAdapter` - `ServiceAdapter` - `ServiceReservationAdapter` -
`SubscriptionAdapter` - `SubscriptionBarbershopAdapter` -
`TransactionAdapter` - `UserAdapter`

## 12. MapStruct

Hay mappers entre capas de entrada y dominio, y entre dominio y
persistencia. No se deben modificar los `build/generated` como fuente
primaria; son salidas generadas.

## 13. Manejo de errores

`GlobalHandlerError` implementa `ErrorWebExceptionHandler` y transforma
excepciones a un JSON con forma:

``` json
{
  "data": {
    "reason": "BUSINESS | TECHNICAL | UNEXPECTED",
    "code": "...",
    "message": "...",
    "date": "..."
  }
}
```

Reglas observadas: - `BusinessExceptions` → HTTP `409 CONFLICT`. -
`TechnicalExceptions.BAD_REQUEST` → HTTP `400 BAD_REQUEST`. -
`TechnicalExceptions.INTERNAL_SERVER_ERROR` / `UNEXPECTED_ERROR` → HTTP
`500`. - Otros casos técnicos → `503 SERVICE_UNAVAILABLE`. -
`ConstraintViolationException` → HTTP `400`.

## 14. Seguridad efectiva por ruta

`SecurityConfig` marca como `permitAll`: - `/ws/payment/**` -
`/auth/**` - `/reservation-service/**` - `/schedule-service/**` -
`/services-service/**` - `/customer-service/**` -
`/reservation-review-service/**` - `/notification-service/**` -
`/public/**`

La cola tiene reglas específicas por rol: - `POST /api/v1/queue/join` →
`CUSTOMER`. - `POST /api/v1/queue/{employeeId}/open|close|next|complete`
→ `BARBER`. - `GET /api/v1/queue/**` → `CUSTOMER`, `BARBER` o `ADMIN`. -
`GET /user-service/**` → `BARBER`. - El resto requiere autenticación
según `.anyExchange().authenticated()`.

> **Importante:** `JwtFilter.isPublicPath()` no replica exactamente
> todos los `permitAll` de `SecurityConfig`; por ejemplo, su lista
> explícita cubre `/auth`, `/reservation-service`, `/schedule-service` y
> `/public`, pero no todas las rutas que `SecurityConfig` declara
> públicas. Para cambios de seguridad revisar ambos archivos.

## 15. WebSocket

`WebsocketConfig` registra: - `/ws/payment` →
`SubscriptionBarbershopWsHandler` - `/ws/virtual-queue` →
`VirtualQueueWsHandler`

Además existe infraestructura WebSocket para pagos: `ConnectionManager`,
`WebSocketPaymentManager`, `ResponseManager`, `GatewayResponseHandler` y
mappers de transacción.

### Cola virtual en tiempo real

La cola combina REST + WebSocket:

``` text
REST → abrir/cerrar/avanzar/completar/unirse/consultar snapshot
                  ↓
           Queue Use Cases
                  ↓
        QueueBroadcastService
                  ↓
       WebSocket /ws/virtual-queue
```

## 16. Configuración externa

`application.yaml` usa variables de entorno para datos sensibles: -
`DB_URL` - `DB_USERNAME` - `DB_PASSWORD` - `MAIL_USERNAME` -
`MAIL_PASSWORD` - `PAYMENT_KEY`

R2DBC pool: `initial-size=5`, `max-size=20`.

## 17. Suscripciones

Hay dos conceptos diferentes:

1.  **`subscription-service`**: catálogo de planes (`Subscription`).
2.  **`subscription-barbershop-service`**: suscripción concreta de una
    barbería (`SubscriptionBarbershop`).

El contexto de autenticación de un empleado/admin obtiene la barbería y
busca su suscripción con estado `ACTIVE`; si no existe, construye un
estado `NOT_SUBSCRIPTION`.

## 18. Flujo de onboarding de administrador/barbería

``` text
POST /public/barber-service/onboarding
        + Authorization Firebase
                ↓
AuthenticationUC.getUserUid()
                ↓
OnboardingBarberShopUc
                ↓
creación de barbería + empleado/usuario según comandos y mappers
                ↓
BarbershopOnBoardingRsDto
```

## 19. Flujo de onboarding de cliente

``` text
POST /public/customer-service/onboarding
        ↓
CustomerOnboardingRqDto
        ↓
CustomerOnboardingCommand
        ↓
CreateCustomerUC / puertos
        ↓
CustomerOnboardingRsDto
```

## 20. Horarios

La entidad funcional `Schedule` está vinculada a un empleado mediante
`empleadoId`. El backend expone: - crear horario - buscar por id de
horario - buscar por empleado - actualizar horario

Request principal: `ScheduleRqDto`. Campos: `empleadoId`, `startTime`,
`endTime`, `lunchStartTime`, `lunchEndTime`, `vacation`.

## 21. Servicios

Los servicios pertenecen a una barbería mediante `barberiaId`.
`ServiceRqDto` recibe nombre, descripción, duración, precio, oferta y
precio especial.

## 22. Reservas

Las reservas se manejan con `ReservationCommand` y el modelo
`Reservation`, no mediante un `ReservationRqDto` dentro de
`infrastructure/entrypoint/reactiveweb/dto`. Esto es importante al
integrar frontend: los endpoints de reservas consumen directamente el
command/modelo definido en `application/command/in/reservation` y
`domain/model/reservation`.

Operaciones: crear, buscar por id, buscar por empleado, cliente o
barbero, confirmar y cancelar.

## 23. Cola virtual

Casos de uso principales: - `OpenQueueUC` - `CloseQueueUC` -
`JoinQueueUC` - `NextCustomerUC` - `CompleteCurrentTurnUC` -
`QueueAvailabilityService` - `QueueBroadcastService` -
`SubscribeQueueUC`

El estado/snapshot se maneja con modelos bajo `domain/model/queue` y
adaptadores en memoria.

## 24. Scheduler

La aplicación tiene `@EnableScheduling`. `RenewAutomaticSubscription`
contiene lógica de renovación automática, pero los `@Scheduled`
observados están comentados en esta versión. Por lo tanto, no asumir que
la renovación automática está ejecutándose actualmente solo por existir
la clase.

## 25. Estructura de referencia

``` text
src/main/java/com/smartbarber/
├── domain/
│   ├── enums/
│   ├── exceptions/
│   ├── model/
│   └── port/
├── application/
│   ├── command/in/
│   ├── mapper/
│   └── usecase/
└── infrastructure/
    ├── drivenadapter/
    │   ├── email/
    │   ├── firebase/
    │   ├── postgres/
    │   └── websocket/
    └── entrypoint/
        ├── reactiveweb/
        │   ├── config/
        │   ├── dto/
        │   ├── exception/
        │   ├── handler/
        │   └── mapper/
        ├── scheduler/
        └── websocket/
```

## 26. Reglas prácticas para consultar/modificar el backend

1.  Si el cambio es de negocio, revisar primero `domain` y el `usecase`
    correspondiente.
2.  Si el cambio es un endpoint, revisar `Router`, `Handler`, DTO y
    mapper de entrada.
3.  Si cambia la persistencia, revisar `Port` → `Adapter` → `Data` →
    `Entity` → mapper.
4.  No modificar `build/generated` como fuente primaria; MapStruct lo
    genera.
5.  Para autenticación revisar conjuntamente `AuthenticationUC`,
    `FirebaseAuthAdapter`, `JwtFilter`, `SecurityConfig` y
    `AuthorizationEntryMapper`/DTO.
6.  Para el contexto de barbería de un usuario empleado/admin, la
    relación relevante es `User → Employee → barberiaId → Barbershop` y
    la sesión de autorización devuelve ese contexto mediante
    `AuthorizationRsDto`.
7.  Para horarios, el identificador funcional de relación es
    `empleadoId`; la barbería se obtiene a través del empleado.
8.  Para servicios, el identificador de pertenencia es `barberiaId`.

## 27. Observaciones de la versión analizada

-   El proyecto contiene artefactos generados (`build/generated`,
    `bin/generated`) que no deben confundirse con la fuente.
-   La autenticación ya cuenta con `authorizationSession()` y
    `AuthorizationRsDto`, por lo que el backend actual sí tiene una
    respuesta de sesión más rica que el simple rol.
-   Las rutas de seguridad y la detección de rutas públicas del
    `JwtFilter` no están completamente alineadas con `SecurityConfig`;
    revisar ambos antes de cambiar permisos.
-   Las rutas de reservas, horarios, servicios, clientes, reseñas y
    notificaciones aparecen como públicas en `SecurityConfig`,
    independientemente de que el frontend pueda aplicar sus propios
    guards.
-   La renovación automática de suscripciones está preparada, pero los
    disparadores `@Scheduled` observados están comentados.

## 28. Archivos clave para comenzar cualquier análisis

  ---------------------------------------------------------------------------------------------------------
  Necesidad                           Archivo(s) clave
  ----------------------------------- ---------------------------------------------------------------------
  Arranque                            `application/SmartbarberApplication.java`

  Seguridad                           `infrastructure/entrypoint/reactiveweb/config/SecurityConfig.java`,
                                      `JwtFilter.java`

  Auth/sesión                         `application/usecase/athentication/AuthenticationUC.java`,
                                      `FirebaseTestHandler.java`, `AuthorizationRsDto.java`

  Rutas                               `infrastructure/entrypoint/reactiveweb/handler/**/**Router.java` /
                                      `*Ruta.java`

  DTOs                                `infrastructure/entrypoint/reactiveweb/dto/**`

  Negocio                             `application/usecase/**`

  Dominio                             `domain/model/**`, `domain/port/**`

  PostgreSQL                          `infrastructure/drivenadapter/postgres/**`

  Tiempo real                         `infrastructure/entrypoint/websocket/**`,
                                      `infrastructure/drivenadapter/websocket/**`

  Configuración                       `src/main/resources/application.yaml`
  ---------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

**Fin del contexto técnico de SmartBarber Backend --- versión
`SmartBarber(6)` analizada.**
