import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';
import { CurrentSubscription } from '../../domain/models/current-subscription.model';

@Injectable()
export class GetCurrentSubscriptionUseCase {

  private readonly repository =
    inject(SubscriptionRepository);

  execute(): Observable<CurrentSubscription> {
    return this.repository.getCurrentSubscription();
  }
}