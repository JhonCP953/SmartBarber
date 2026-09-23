import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { of, throwError } from 'rxjs';

import { CancelSubscriptionComponent } from './cancel-subscription.component';
import {
  CancelSubscriptionRequest
} from '../../domain/models/cancel-subscription.model';

import { GetCurrentSubscriptionUseCase } from '../../application/use-cases/get-current-subscription.use-case';

import { CancelSubscriptionUseCase } from '../../application/use-cases/cancel-subscription.use-case';

import { CurrentSubscription } from '../../domain/models/current-subscription.model';

describe('CancelSubscriptionComponent', () => {

  let component: CancelSubscriptionComponent;

  let fixture:
    ComponentFixture<CancelSubscriptionComponent>;

  const currentSubscription: CurrentSubscription = {

    id: 'sub-001',

    status: 'ACTIVE',

    startDate: '2026-09-01T00:00:00Z',

    renewalDate: '2026-10-01T00:00:00Z',

    cancellationReasonRequired: true,

    plan: {

      id: 'plan-pro',

      code: 'PRO',

      name: 'Plan Pro',

      description: 'Plan profesional',

      price: 120000,

      currency: 'COP',

      billingPeriod: 'MONTHLY',

      features: [
        'Reservas',
        'Cola virtual',
        'Analítica'
      ],

      active: true

    }

  };

  const getCurrentSubscriptionUseCaseMock = {

    execute: jasmine
      .createSpy()
      .and
      .returnValue(
        of(currentSubscription)
      )

  };

  const cancelSubscriptionUseCaseMock = {

    execute: jasmine
      .createSpy()
      .and
      .returnValue(
        of({
          subscriptionId: 'sub-001',

          previousPlan:
            currentSubscription.plan,

          status: 'CANCELLED',

          cancellationDate:
            '2026-09-13T15:00:00Z',

          effectiveDate:
            '2026-10-13T15:00:00Z',

          historyRetained: true,

          availableFeatures: [
            'Consulta de historial'
          ],

          restrictedFeatures: [
            'Nuevas reservas'
          ],

          message:
            'Suscripción cancelada correctamente.'
        })
      )

  };

  beforeEach(async () => {

    await TestBed.configureTestingModule({

      imports: [
        CancelSubscriptionComponent
      ],

      providers: [

        {
          provide:
            GetCurrentSubscriptionUseCase,

          useValue:
            getCurrentSubscriptionUseCaseMock
        },

        {
          provide:
            CancelSubscriptionUseCase,

          useValue:
            cancelSubscriptionUseCaseMock
        }

      ]

    }).compileComponents();

    fixture =
      TestBed.createComponent(
        CancelSubscriptionComponent
      );

    component =
      fixture.componentInstance;

    fixture.detectChanges();

  });


  it('should create', () => {

    expect(component)
      .toBeTruthy();

  });


  it('should load current subscription', () => {

    expect(
      component.currentSubscription()
    )
      .toEqual(currentSubscription);

  });


  it('should require a reason when configured', () => {

    expect(
      component.reasonRequired()
    )
      .toBeTrue();

    expect(
      component.canContinue()
    )
      .toBeFalse();

  });


  it('should allow confirmation after selecting a reason', () => {

    component.selectReason(
      'La barbería ya no requiere el servicio'
    );

    expect(
      component.canContinue()
    )
      .toBeTrue();

  });


  it('should open confirmation', () => {

    component.selectReason(
      'La barbería ya no requiere el servicio'
    );

    component.openConfirmation();

    expect(
      component.showConfirmation()
    )
      .toBeTrue();

  });


  it('should cancel confirmation', () => {

    component.selectReason(
      'La barbería ya no requiere el servicio'
    );

    component.openConfirmation();

    component.cancelConfirmation();

    expect(
      component.showConfirmation()
    )
      .toBeFalse();

  });


  it('should execute cancellation after confirmation', () => {

    component.selectReason(
      'La barbería ya no requiere el servicio'
    );

    component.openConfirmation();

    component.confirmCancellation();

    expect(
      cancelSubscriptionUseCaseMock.execute
    )
      .toHaveBeenCalledWith({

        subscriptionId:
          'sub-001',

        reason:
          'La barbería ya no requiere el servicio',

        reasonDetail:
          undefined

      });

  });


  it('should update the status after successful cancellation', () => {

    component.selectReason(
      'La barbería ya no requiere el servicio'
    );

    component.confirmCancellation();

    expect(
      component.cancellationCompleted()
    )
      .toBeTrue();

    expect(
      component.successResponse()
    )
      .toBeTruthy();

    expect(
      component.currentSubscription()?.status
    )
      .toBe('CANCELLED');

  });


  it('should retain subscription history', () => {

    component.selectReason(
      'La barbería ya no requiere el servicio'
    );

    component.confirmCancellation();

    expect(
      component.successResponse()?.historyRetained
    )
      .toBeTrue();

  });


  it('should handle cancellation errors', () => {

    cancelSubscriptionUseCaseMock.execute.and.returnValue(
      throwError(() => ({
        error: {
          code: 'SUBSCRIPTION_ALREADY_CANCELLED'
        }
      }))
    );

    component.selectReason(
      'La barbería ya no requiere el servicio'
    );

    component.openConfirmation();

    component.confirmCancellation();

    expect(
      component.errorMessage()
    )
      .toBe(
        'La suscripción ya se encuentra cancelada.'
      );

  });

  it('should display current subscription information', () => {

    const compiled =
      fixture.nativeElement as HTMLElement;

    expect(
      compiled.textContent
    ).toContain('Plan Pro');

    expect(
      compiled.textContent
    ).toContain('Suscripción actual');

  });
  it('should display current subscription information', () => {

    const compiled =
      fixture.nativeElement as HTMLElement;

    expect(
      compiled.textContent
    ).toContain('Plan Pro');

    expect(
      compiled.textContent
    ).toContain('Suscripción actual');

  });

  it('should display cancellation reasons', () => {

    const compiled =
      fixture.nativeElement as HTMLElement;

    expect(
      compiled.textContent
    ).toContain(
      'El precio no se ajusta a mis necesidades'
    );

    expect(
      compiled.textContent
    ).toContain(
      'La barbería ya no requiere el servicio'
    );

  });

  it('should cancel subscription', () => {

    const request: CancelSubscriptionRequest = {

      subscriptionId: 'sub-001',

      reason:
        'La barbería ya no requiere el servicio',

      reasonDetail:
        'Ya no utilizaremos la plataforma.'

    };

    service.cancelSubscription(request)
      .subscribe(response => {

        expect(response.status)
          .toBe('CANCELLED');

        expect(response.historyRetained)
          .toBeTrue();

      });

    const req =
      httpMock.expectOne(
        `${environment.apiUrl}/subscriptions/cancel`
      );

    expect(req.request.method)
      .toBe('POST');

    expect(req.request.body)
      .toEqual(request);

    req.flush({

      subscriptionId: 'sub-001',

      previousPlan: {} as any,

      status: 'CANCELLED',

      cancellationDate:
        '2026-09-13T15:00:00Z',

      effectiveDate:
        '2026-10-13T15:00:00Z',

      historyRetained: true,

      availableFeatures: [
        'Consulta de historial'
      ],

      restrictedFeatures: [
        'Nuevas reservas'
      ],

      message:
        'Suscripción cancelada correctamente.'

    });

  });
});