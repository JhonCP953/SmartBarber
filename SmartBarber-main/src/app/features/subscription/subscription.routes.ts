import {
    Routes
} from '@angular/router';


// =====================================================
// REPOSITORIOS
// =====================================================

import {
    SubscriptionRepository
} from './domain/repositories/subscription.repository';

import {
    SubscriptionApiService
} from './infrastructure/api/subscription-api.service';

import {
    PaymentRepository
} from './domain/repositories/payment.repository';

import {
    PaymentApiService
} from './infrastructure/api/payment-api.service';


// =====================================================
// USE CASES - SUSCRIPCIÓN
// =====================================================

import {
    GetCurrentSubscriptionUseCase
} from './application/use-cases/get-current-subscription.use-case';

import {
    GetSubscriptionPlansUseCase
} from './application/use-cases/get-subscription-plans.use-case';

import {
    ChangeSubscriptionPlanUseCase
} from './application/use-cases/change-subscription-plan.use-case';

import {
    CancelSubscriptionUseCase
} from './application/use-cases/cancel-subscription.use-case';

import {
    RenewSubscriptionUseCase
} from './application/use-cases/renew-subscription.use-case';


// =====================================================
// USE CASES - PAGOS
// =====================================================

import {
    GetPaymentHistoryUseCase
} from './application/use-cases/get-payment-history.use-case';


export const SUBSCRIPTION_ROUTES:
    Routes = [


    // =================================================
    // ESTADO ACTUAL
    // =================================================

    {
        path: '',

        providers: [

            {
                provide:
                    SubscriptionRepository,

                useClass:
                    SubscriptionApiService
            },

            GetCurrentSubscriptionUseCase

        ],

        loadComponent: () =>
            import(
                './pages/subscription-status/subscription-status.component'
            ).then(
                m =>
                    m.SubscriptionStatusComponent
            )
    },


    // =================================================
    // RENOVAR
    // =================================================

    {
        path: 'renew',

        providers: [

            {
                provide:
                    SubscriptionRepository,

                useClass:
                    SubscriptionApiService
            },

            GetCurrentSubscriptionUseCase,

            RenewSubscriptionUseCase

        ],

        loadComponent: () =>
            import(
                './pages/renew-subscription/renew-subscription.component'
            ).then(
                m =>
                    m.RenewSubscriptionComponent
            )
    },


    // =================================================
    // CAMBIAR PLAN
    // =================================================

    {
        path: 'change-plan',

        providers: [

            {
                provide:
                    SubscriptionRepository,

                useClass:
                    SubscriptionApiService
            },

            GetCurrentSubscriptionUseCase,

            GetSubscriptionPlansUseCase,

            ChangeSubscriptionPlanUseCase

        ],

        loadComponent: () =>
            import(
                './pages/change-plan/change-plan.component'
            ).then(
                m =>
                    m.ChangePlanComponent
            )
    },


    // =================================================
    // HISTORIAL DE PAGOS
    // =================================================

    {
        path: 'payment-history',

        providers: [

            {
                provide:
                    PaymentRepository,

                useClass:
                    PaymentApiService
            },

            GetPaymentHistoryUseCase

        ],

        loadComponent: () =>
            import(
                './pages/payment-history/payment-history.component'
            ).then(
                m =>
                    m.PaymentHistoryComponent
            )
    },


    // =================================================
    // CANCELAR
    // =================================================

    {
        path: 'cancel',

        providers: [

            {
                provide:
                    SubscriptionRepository,

                useClass:
                    SubscriptionApiService
            },

            GetCurrentSubscriptionUseCase,

            CancelSubscriptionUseCase

        ],

        loadComponent: () =>
            import(
                './pages/cancel-subscription/cancel-subscription.component'
            ).then(
                m =>
                    m.CancelSubscriptionComponent
            )
    }

];