import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';
import { SubscriptionCatalogPlan } from '../../domain/models/subscription-catalog.model';

import { CurrentSubscription } from '../../domain/models/current-subscription.model';

import {
  ChangePlanRequest,
  ChangePlanResponse
} from '../../domain/models/change-plan.model';

import { SubscriptionPlan } from '../../domain/models/subscription-plan.model';

import {
  CancelSubscriptionRequest,
  CancelSubscriptionResponse
} from '../../domain/models/cancel-subscription.model';

import { RenewSubscriptionRequest, RenewSubscriptionResponse } from '../../domain/models/renew-subscription.model';

@Injectable()
export class SubscriptionApiService extends SubscriptionRepository {
  private readonly http = inject(HttpClient);

  getSubscriptionCatalog(): Observable<SubscriptionCatalogPlan[]> {
    return this.http.get<SubscriptionCatalogPlan[]>(
      `${environment.apiUrl}/subscription-service/all`
    );
  }

  private readonly unsupported = {
    current: 'El backend actual no expone la consulta de la suscripción vigente de una barbería.',
    plans: 'El catálogo del backend usa un DTO distinto al que espera el cliente legado de suscripciones.',
    change: 'El backend actual no documenta una operación para cambiar el plan de una suscripción.',
    cancel: 'El backend actual no documenta una operación para cancelar una suscripción.',
    renew: 'La renovación usa SubscriptionBarbershopRqDto y PUT /subscription-barbershop-service/renew. Utiliza SubscriptionWsService para enviar el contrato respaldado por backend.'
  };

  override getCurrentSubscription():
    Observable<CurrentSubscription> {
    return throwError(() => new Error(this.unsupported.current));
  }

  override getAvailablePlans():
    Observable<SubscriptionPlan[]> {
    return throwError(() => new Error(this.unsupported.plans));
  }

  override changePlan(
    _request: ChangePlanRequest
  ): Observable<ChangePlanResponse> {
    return throwError(() => new Error(this.unsupported.change));
  }

  override cancelSubscription(
    _request: CancelSubscriptionRequest
  ): Observable<CancelSubscriptionResponse> {
    return throwError(() => new Error(this.unsupported.cancel));
  }

  override renewSubscription(
    _request: RenewSubscriptionRequest
  ): Observable<RenewSubscriptionResponse> {
    return throwError(() => new Error(this.unsupported.renew));
  }
}