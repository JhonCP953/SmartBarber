import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
    RenewSubscriptionRequest,
    RenewSubscriptionResponse
} from '../../domain/models/renew-subscription.model';

import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';

@Injectable()
export class RenewSubscriptionUseCase {

    private readonly repository = inject(SubscriptionRepository);

    execute(
        request: RenewSubscriptionRequest
    ): Observable<RenewSubscriptionResponse> {
        return this.repository.renewSubscription(request);
    }
}