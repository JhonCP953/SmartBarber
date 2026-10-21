import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';

import {
  PaymentRepository
} from '../../domain/repositories/payment.repository';

import {
  PaymentHistory,
  PaymentHistoryFilters
} from '../../domain/models/payment-history.model';

@Injectable()
export class PaymentApiService
  extends PaymentRepository {

  override getPaymentHistory(
    _filters: PaymentHistoryFilters
  ): Observable<PaymentHistory> {
    return throwError(
      () => new Error(
        'El backend actual no expone un endpoint para consultar el historial de transacciones.'
      )
    );
  }

}