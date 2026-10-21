import { TestBed } from '@angular/core/testing';
import { PaymentApiService } from './payment-api.service';

describe('PaymentApiService', () => {
  let service: PaymentApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PaymentApiService]
    });

    service = TestBed.inject(PaymentApiService);
  });

  it('does not request an undocumented payment-history endpoint', () => {
    service.getPaymentHistory({
      page: 0,
      size: 10
    }).subscribe({
      error: error => expect(error.message).toContain(
        'no expone un endpoint para consultar el historial'
      )
    });
  });
});
