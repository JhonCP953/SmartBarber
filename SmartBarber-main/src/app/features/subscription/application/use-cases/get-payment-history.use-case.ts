import {
  Injectable,
  inject
} from '@angular/core';

import { Observable } from 'rxjs';

import {
  PaymentHistory,
  PaymentHistoryFilters
} from '../../domain/models/payment-history.model';

import {
  PaymentRepository
} from '../../domain/repositories/payment.repository';

@Injectable()
export class GetPaymentHistoryUseCase {

  private readonly repository =
    inject(PaymentRepository);

  execute(
    filters: PaymentHistoryFilters
  ): Observable<PaymentHistory> {

    return this.repository.getPaymentHistory(
      filters
    );

  }

}