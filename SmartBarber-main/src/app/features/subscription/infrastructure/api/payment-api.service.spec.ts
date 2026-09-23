import { TestBed } from '@angular/core/testing';

import {
  provideHttpClient
} from '@angular/common/http';

import {
  provideHttpClientTesting,
  HttpTestingController
} from '@angular/common/http/testing';

import { PaymentApiService } from './payment-api.service';

import {
  PaymentHistoryFilters
} from '../../domain/models/payment-history.model';

import { environment } from '../../../../../environments/environment';

describe(
  'PaymentApiService',
  () => {

    let service:
      PaymentApiService;

    let httpMock:
      HttpTestingController;


    beforeEach(() => {

      TestBed.configureTestingModule({

        providers: [

          PaymentApiService,

          provideHttpClient(),

          provideHttpClientTesting()

        ]

      });

      service =
        TestBed.inject(
          PaymentApiService
        );

      httpMock =
        TestBed.inject(
          HttpTestingController
        );

    });


    afterEach(() => {

      httpMock.verify();

    });


    it(
      'should request payment history with pagination',
      () => {

        const filters:
          PaymentHistoryFilters = {

            page: 1,

            size: 10

          };


        service
          .getPaymentHistory(filters)
          .subscribe();


        const request =
          httpMock.expectOne(
            `${environment.apiUrl}/subscriptions/payments?page=1&size=10`
          );


        expect(
          request.request.method
        )
          .toBe('GET');


        request.flush({

          content: [],

          page: 1,

          size: 10,

          totalElements: 0,

          totalPages: 0

        });

      }
    );


    it(
      'should send payment history filters',
      () => {

        const filters:
          PaymentHistoryFilters = {

            page: 0,

            size: 10,

            status: 'PAID',

            fromDate:
              '2026-09-01',

            toDate:
              '2026-09-13'

          };


        service
          .getPaymentHistory(filters)
          .subscribe();


        const request =
          httpMock.expectOne(
            `${environment.apiUrl}/subscriptions/payments?page=0&size=10&status=PAID&fromDate=2026-09-01&toDate=2026-09-13`
          );


        expect(
          request.request.method
        )
          .toBe('GET');


        expect(
          request.request.params.get(
            'status'
          )
        )
          .toBe('PAID');


        expect(
          request.request.params.get(
            'fromDate'
          )
        )
          .toBe('2026-09-01');


        expect(
          request.request.params.get(
            'toDate'
          )
        )
          .toBe('2026-09-13');


        request.flush({

          content: [],

          page: 0,

          size: 10,

          totalElements: 0,

          totalPages: 0

        });

      }
    );

  }
);