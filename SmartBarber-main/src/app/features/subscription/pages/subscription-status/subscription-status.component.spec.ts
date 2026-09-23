import {
    ComponentFixture,
    TestBed
} from '@angular/core/testing';

import {
    of,
    throwError
} from 'rxjs';

import {
    SubscriptionStatusComponent
} from './subscription-status.component';

import {
    GetCurrentSubscriptionUseCase
} from '../../application/use-cases/get-current-subscription.use-case';


const activeSubscription = {

    id: 'sub-001',

    plan: {

        id: 'plan-001',

        code: 'BASIC',

        name: 'Plan Básico',

        description:
            'Plan inicial para barberías.',

        price: 60000,

        currency: 'COP',

        billingPeriod: 'MONTHLY' as const,

        features: [
            'Gestión de reservas',
            'Gestión de clientes',
            'Dashboard básico'
        ],

        active: true

    },

    status: 'ACTIVE' as const,

    startDate:
        '2026-09-01T00:00:00',

    renewalDate:
        '2026-10-01T00:00:00',

    cancellationReasonRequired:
        true

};


describe(
    'SubscriptionStatusComponent',
    () => {

        let component:
            SubscriptionStatusComponent;

        let fixture:
            ComponentFixture<SubscriptionStatusComponent>;

        let executeSpy:
            jasmine.Spy;


        beforeEach(
            async () => {

                executeSpy =
                    jasmine
                        .createSpy('execute')
                        .and
                        .returnValue(
                            of(
                                activeSubscription
                            )
                        );


                await TestBed
                    .configureTestingModule({

                        imports: [
                            SubscriptionStatusComponent
                        ],

                        providers: [

                            {

                                provide:
                                    GetCurrentSubscriptionUseCase,

                                useValue: {

                                    execute:
                                        executeSpy

                                }

                            }

                        ]

                    })
                    .compileComponents();


                fixture =
                    TestBed.createComponent(
                        SubscriptionStatusComponent
                    );

                component =
                    fixture.componentInstance;

                fixture.detectChanges();

            }
        );


        it(
            'should create',
            () => {

                expect(
                    component
                )
                    .toBeTruthy();

            }
        );


        it(
            'should load the current subscription',
            () => {

                expect(
                    executeSpy
                )
                    .toHaveBeenCalled();

                expect(
                    component
                        .currentSubscription()
                        ?.id
                )
                    .toBe('sub-001');

            }
        );


        it(
            'should show the active status',
            () => {

                expect(
                    component.statusLabel()
                )
                    .toBe('Activa');

                expect(
                    component.isActive()
                )
                    .toBeTrue();

            }
        );


        it(
            'should show the subscription plan name',
            () => {

                expect(
                    component
                        .currentSubscription()
                        ?.plan.name
                )
                    .toBe('Plan Básico');

            }
        );


        it(
            'should show the plan benefits',
            () => {

                expect(
                    component
                        .currentSubscription()
                        ?.plan.features
                )
                    .toEqual([

                        'Gestión de reservas',

                        'Gestión de clientes',

                        'Dashboard básico'

                    ]);

            }
        );


        it(
            'should allow changing plan when subscription is active',
            () => {

                expect(
                    component.canChangePlan()
                )
                    .toBeTrue();

            }
        );


        it(
            'should allow cancelling when subscription is active',
            () => {

                expect(
                    component.canCancel()
                )
                    .toBeTrue();

            }
        );


        it(
            'should allow renewing an active subscription',
            () => {

                expect(
                    component.canRenew()
                )
                    .toBeTrue();

            }
        );


        it(
            'should calculate remaining days',
            () => {

                const days =
                    component.daysRemaining();

                expect(
                    days
                )
                    .not
                    .toBeNull();

                expect(
                    days!
                )
                    .toBeGreaterThanOrEqual(0);

            }
        );


        it(
            'should identify pending status',
            () => {

                component.currentSubscription.set({

                    ...activeSubscription,

                    status: 'PENDING'

                });

                expect(
                    component.statusLabel()
                )
                    .toBe('Pendiente');

                expect(
                    component.canChangePlan()
                )
                    .toBeFalse();

                expect(
                    component.canCancel()
                )
                    .toBeFalse();

            }
        );


        it(
            'should identify past due status',
            () => {

                component.currentSubscription.set({

                    ...activeSubscription,

                    status: 'PAST_DUE'

                });

                expect(
                    component.statusLabel()
                )
                    .toBe('Pago pendiente');

                expect(
                    component.canRenew()
                )
                    .toBeTrue();

            }
        );


        it(
            'should identify pending cancellation status',
            () => {

                component.currentSubscription.set({

                    ...activeSubscription,

                    status:
                        'PENDING_CANCELLATION',

                    cancellationEffectiveDate:
                        '2026-10-01T00:00:00'

                });

                expect(
                    component.statusLabel()
                )
                    .toBe('Cancelación programada');

                expect(
                    component.canChangePlan()
                )
                    .toBeFalse();

                expect(
                    component.canCancel()
                )
                    .toBeFalse();

            }
        );


        it(
            'should identify cancelled status',
            () => {

                component.currentSubscription.set({

                    ...activeSubscription,

                    status:
                        'CANCELLED'

                });

                expect(
                    component.statusLabel()
                )
                    .toBe('Cancelada');

                expect(
                    component.canChangePlan()
                )
                    .toBeFalse();

                expect(
                    component.canCancel()
                )
                    .toBeFalse();

            }
        );


        it(
            'should identify expired status',
            () => {

                component.currentSubscription.set({

                    ...activeSubscription,

                    status:
                        'EXPIRED'

                });

                expect(
                    component.statusLabel()
                )
                    .toBe('Vencida');

                expect(
                    component.canRenew()
                )
                    .toBeTrue();

                expect(
                    component.canChangePlan()
                )
                    .toBeFalse();

                expect(
                    component.canCancel()
                )
                    .toBeFalse();

            }
        );


        it(
            'should show an error when subscription cannot be loaded',
            () => {

                executeSpy.and.returnValue(
                    throwError(
                        () => ({
                            error: {
                                code:
                                    'SUBSCRIPTION_NOT_FOUND'
                            }
                        })
                    )
                );


                component.reload();


                expect(
                    component.errorMessage()
                )
                    .toBe(
                        'No se encontró una suscripción asociada a la barbería.'
                    );

            }
        );

    }
);