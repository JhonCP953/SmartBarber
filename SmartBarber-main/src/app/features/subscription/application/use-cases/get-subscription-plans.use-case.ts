import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';
import { SubscriptionPlan } from '../../domain/models/subscription-plan.model';

@Injectable()
export class GetSubscriptionPlansUseCase {

  private readonly repository =
    inject(SubscriptionRepository);

  execute(): Observable<SubscriptionPlan[]> {
    return this.repository.getAvailablePlans();
  }
}