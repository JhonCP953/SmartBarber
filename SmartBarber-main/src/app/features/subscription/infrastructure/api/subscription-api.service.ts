import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';

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

  private readonly baseUrl =
    `${environment.apiUrl}/subscriptions`;

  override getCurrentSubscription():
    Observable<CurrentSubscription> {

    return this.http.get<CurrentSubscription>(
      `${this.baseUrl}/current`
    );
  }

  override getAvailablePlans():
    Observable<SubscriptionPlan[]> {

    return this.http.get<SubscriptionPlan[]>(
      `${this.baseUrl}/plans`
    );
  }

  override changePlan(
    request: ChangePlanRequest
  ): Observable<ChangePlanResponse> {

    return this.http.post<ChangePlanResponse>(
      `${this.baseUrl}/change-plan`,
      request
    );
  }

  override cancelSubscription(
    request: CancelSubscriptionRequest
  ): Observable<CancelSubscriptionResponse> {

    return this.http.post<CancelSubscriptionResponse>(
      `${this.baseUrl}/cancel`,
      request
    );
  }

  override renewSubscription(
    request: RenewSubscriptionRequest
  ): Observable<RenewSubscriptionResponse> {
    return this.http.post<RenewSubscriptionResponse>(
      `${this.baseUrl}/renew`,
      request
    );
  }
}