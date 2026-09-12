import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/landing/landing.routes')
            .then(m => m.LANDING_ROUTES)
      },

      {
        path: 'barberShop',
        loadChildren: () =>
          import('./features/barber-shop/barber-shop.routes')
            .then(m => m.BARBER_SHOP_ROUTES)
      },

      {
        path: 'subscription',
        loadChildren: () =>
          import('./features/subscription/subscription.routes')
            .then(m => m.SUBSCRIPTION_ROUTES)
      },
      
      {
        path: 'reservar',
        loadChildren: () =>
          import('./features/reservations/reservations.routes')
            .then(m => m.RESERVATION_ROUTES)
      }
    ]
  },

  {
    path: '**',
    redirectTo: ''
  }
];