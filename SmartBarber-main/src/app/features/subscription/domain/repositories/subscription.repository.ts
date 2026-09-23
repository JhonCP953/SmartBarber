import { Observable } from 'rxjs';

import { CurrentSubscription } from '../models/current-subscription.model';

import {
  ChangePlanRequest,
  ChangePlanResponse
} from '../models/change-plan.model';

import { SubscriptionPlan } from '../models/subscription-plan.model';

import {
  CancelSubscriptionRequest,
  CancelSubscriptionResponse
} from '../models/cancel-subscription.model';

import { RenewSubscriptionRequest, RenewSubscriptionResponse } from '../models/renew-subscription.model';

/**
 * Define el contrato para el acceso a los datos relacionados con las suscripciones.
 *
 * Esta clase utiliza el patrón Repository y funciona como una abstracción entre la lógica de negocio y la fuente de datos.
 * La implementación concreta del repositorio será responsable de determinar cómo se obtienen o modifican los datos, por ejemplo,
 * mediante peticiones HTTP a una API.
 *
 * Al ser una clase abstracta, no puede ser instanciada directamente. Las clases que la extiendan deberán implementar todos sus métodos.
 */

export abstract class SubscriptionRepository {

  //    Obtiene la suscripción actual del usuario autenticado.
  //    Un Observable que emite la información de la suscripción actual del usuario.

  abstract getCurrentSubscription(): Observable<CurrentSubscription>;

  // Obtiene los planes de suscripción disponibles para el usuario.
  // Un Observable que emite una lista de planes de suscripción disponibles

  abstract getAvailablePlans(): Observable<SubscriptionPlan[]>;

  //   Solicita el cambio del plan de suscripción actual.
  // @param request Datos necesarios para realizar el cambio de plan.
  // @returns Un Observable que emite la respuesta generada después de procesar el cambio de plan.

  abstract changePlan(
    request: ChangePlanRequest
  ): Observable<ChangePlanResponse>;

  abstract cancelSubscription(
    request: CancelSubscriptionRequest
  ): Observable<CancelSubscriptionResponse>;

  abstract renewSubscription(
    request: RenewSubscriptionRequest
  ): Observable<RenewSubscriptionResponse>;
}