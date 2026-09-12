import { Routes } from '@angular/router';

export const SUBSCRIPTION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/subscription/subscription.component')
        .then(m => m.SubscriptionComponent)
  }
];