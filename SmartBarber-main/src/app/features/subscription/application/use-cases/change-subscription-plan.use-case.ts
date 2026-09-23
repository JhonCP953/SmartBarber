import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';

import {
  ChangePlanRequest,
  ChangePlanResponse
} from '../../domain/models/change-plan.model';

@Injectable()
export class ChangeSubscriptionPlanUseCase {

  private readonly repository =
    inject(SubscriptionRepository);

  execute(
    request: ChangePlanRequest
  ): Observable<ChangePlanResponse> {

    return this.repository.changePlan(request);
  }
}