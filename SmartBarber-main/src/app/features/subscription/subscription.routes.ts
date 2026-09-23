import { Routes } from '@angular/router';
import { SubscriptionComponent } from './components/subscription/subscription.component';
import { MySubscriptionComponent } from './components/my-subscription/my-subscription.component';


import { SubscriptionRepository } from './domain/repositories/subscription.repository';
import { SubscriptionApiService } from './infrastructure/api/subscription-api.service';

import { GetCurrentSubscriptionUseCase } from './application/use-cases/get-current-subscription.use-case';
import { GetSubscriptionPlansUseCase } from './application/use-cases/get-subscription-plans.use-case';
import { ChangeSubscriptionPlanUseCase } from './application/use-cases/change-subscription-plan.use-case';
import { CancelSubscriptionUseCase } from './application/use-cases/cancel-subscription.use-case';

import { PaymentRepository } from './domain/repositories/payment.repository';
import { GetPaymentHistoryUseCase } from './application/use-cases/get-payment-history.use-case';
import { PaymentApiService } from './infrastructure/api/payment-api.service';

import { RenewSubscriptionUseCase } from './application/use-cases/renew-subscription.use-case';

export const SUBSCRIPTION_ROUTES: Routes = [

  /*
   * PS-19
   * Estado de la suscripción
   */
  {
    path: '',

    loadComponent: () =>
      import(
        './components/subscription/subscription.component'
      )
        .then(
          m =>
            m.SubscriptionComponent
        )
  },

  /*
 * PS-15
 * Renovación
 */

  {
    path: 'renew',
    providers: [
      { provide: SubscriptionRepository, useClass: SubscriptionApiService },
      GetCurrentSubscriptionUseCase,
      RenewSubscriptionUseCase
    ],
    loadComponent: () =>
      import('./pages/renew-subscription/renew-subscription.component')
        .then(m => m.RenewSubscriptionComponent)
  },

  /*
   * PS-16
   * Cambio de plan
   */
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
      )
        .then(
          m =>
            m.ChangePlanComponent
        )
  },


  /*
   * PS-18
   * Historial de pagos
   */
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
      )
        .then(
          m =>
            m.PaymentHistoryComponent
        )
  },


  /*
   * PS-17
   * Cancelación
   */
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
      )
        .then(
          m =>
            m.CancelSubscriptionComponent
        )
  }

];