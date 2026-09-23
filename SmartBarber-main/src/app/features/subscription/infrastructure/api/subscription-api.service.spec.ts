import { TestBed } from '@angular/core/testing';

import {
  provideHttpClient
} from '@angular/common/http';

import {
  provideHttpClientTesting,
  HttpTestingController
} from '@angular/common/http/testing';

import { SubscriptionApiService } from './subscription-api.service';

import { environment } from '../../../../../environments/environment';

describe('SubscriptionApiService', () => {

  let service: SubscriptionApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        SubscriptionApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service =
      TestBed.inject(
        SubscriptionApiService
      );

    httpMock =
      TestBed.inject(
        HttpTestingController
      );
  });


  afterEach(() => {
    httpMock.verify();
  });


  it('should request current subscription', () => {

    service.getCurrentSubscription()
      .subscribe();

    const request =
      httpMock.expectOne(
        `${environment.apiUrl}/subscriptions/current`
      );

    expect(request.request.method)
      .toBe('GET');

    request.flush({});

  });


  it('should request available plans', () => {

    service.getAvailablePlans()
      .subscribe();

    const request =
      httpMock.expectOne(
        `${environment.apiUrl}/subscriptions/plans`
      );

    expect(request.request.method)
      .toBe('GET');

    request.flush([]);

  });


  it('should send change plan request', () => {

    const body = {
      subscriptionId: 'sub-001',
      newPlanId: 'plan-professional'
    };

    service.changePlan(body)
      .subscribe();

    const request =
      httpMock.expectOne(
        `${environment.apiUrl}/subscriptions/change-plan`
      );

    expect(request.request.method)
      .toBe('POST');

    expect(request.request.body)
      .toEqual(body);

    request.flush({});

  });

});