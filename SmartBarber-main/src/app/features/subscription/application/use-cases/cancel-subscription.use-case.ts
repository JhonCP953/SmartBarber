import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';

import {
  CancelSubscriptionRequest,
  CancelSubscriptionResponse
} from '../../domain/models/cancel-subscription.model';

@Injectable()
export class CancelSubscriptionUseCase {

  private readonly repository =
    inject(SubscriptionRepository);

  execute(
    request: CancelSubscriptionRequest
  ): Observable<CancelSubscriptionResponse> {

    return this.repository.cancelSubscription(request);
  }
}