import { TestBed } from '@angular/core/testing';
import { SubscriptionApiService } from './subscription-api.service';

describe('SubscriptionApiService', () => {
  let service: SubscriptionApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SubscriptionApiService]
    });

    service = TestBed.inject(SubscriptionApiService);
  });

  it('does not request an undocumented current-subscription endpoint', () => {
    service.getCurrentSubscription().subscribe({
      error: error => expect(error.message).toContain(
        'no expone la consulta de la suscripción vigente'
      )
    });
  });

  it('rejects cancellation until the backend exposes that operation', () => {
    service.cancelSubscription({
      subscriptionId: 'sub-001',
      reason: 'Otro'
    }).subscribe({
      error: error => expect(error.message).toContain(
        'no documenta una operación para cancelar'
      )
    });
  });
});
