import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';

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

  private readonly http =
    inject(HttpClient);

  private readonly baseUrl =
    `${environment.apiUrl}/subscriptions/payments`;

  override getPaymentHistory(
    filters: PaymentHistoryFilters
  ): Observable<PaymentHistory> {

    let params =
      new HttpParams()
        .set('page', filters.page.toString())
        .set('size', filters.size.toString());

    if (filters.status) {
      params =
        params.set(
          'status',
          filters.status
        );
    }

    if (filters.fromDate) {
      params =
        params.set(
          'fromDate',
          filters.fromDate
        );
    }

    if (filters.toDate) {
      params =
        params.set(
          'toDate',
          filters.toDate
        );
    }

    return this.http.get<PaymentHistory>(
      this.baseUrl,
      {
        params
      }
    );

  }

}