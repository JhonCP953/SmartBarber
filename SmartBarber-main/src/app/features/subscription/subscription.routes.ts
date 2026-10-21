import { Routes } from '@angular/router';
import { SubscriptionApiService } from './infrastructure/api/subscription-api.service';

export const SUBSCRIPTION_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/subscription-dashboard/subscription-dashboard.component')
        .then(m => m.SubscriptionDashboardComponent)
  },
  {
    path: 'status',
    loadComponent: () =>
      import('./pages/subscription-status/subscription-status.component')
        .then(m => m.SubscriptionStatusComponent)
  },
  {
    path: 'renewal',
    providers: [SubscriptionApiService],
    loadComponent: () =>
      import('./pages/renewal-catalog/renewal-catalog.component')
        .then(m => m.RenewalCatalogComponent)
  },
  {
    path: 'payment-history',
    data: {
      title: 'Historial de pagos',
      description: 'Consulta las transacciones de suscripción de tu barbería.',
      availability: 'La API documentada no expone todavía un endpoint de consulta del historial de transacciones.'
    },
    loadComponent: () =>
      import('./pages/subscription-module/subscription-module.component')
        .then(m => m.SubscriptionModuleComponent)
  },
  {
    path: 'cancel',
    data: {
      title: 'Cancelar suscripción',
      description: 'Administra la vigencia de la suscripción de tu barbería.',
      availability: 'La API documentada no incluye una operación para cancelar una suscripción. No se enviará una solicitud a un endpoint no confirmado.'
    },
    loadComponent: () =>
      import('./pages/subscription-module/subscription-module.component')
        .then(m => m.SubscriptionModuleComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];