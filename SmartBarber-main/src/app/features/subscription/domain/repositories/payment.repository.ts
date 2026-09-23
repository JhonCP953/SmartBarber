import { Observable } from 'rxjs';

import {
  PaymentHistory,
  PaymentHistoryFilters
} from '../models/payment-history.model';

export abstract class PaymentRepository {

  abstract getPaymentHistory(
    filters: PaymentHistoryFilters
  ): Observable<PaymentHistory>;

}