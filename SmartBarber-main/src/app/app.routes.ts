import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';

import { authGuard } from './core/auth/guards/auth.guard';
import { roleGuard } from './core/auth/guards/role.guard';

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
      },
      {
        path: 'auth',
        loadChildren: () =>
          import('./features/authentication/authentication.routes')
            .then(m => m.AUTHENTICATION_ROUTES)
      }

    ]
  },


  /*
   * Las rutas privadas de cliente y administrador deben agregarse aquí cuando sus módulos estén definidos.
   *
   * Ejemplo de protección:
   *
   * {
   *   path: 'admin',
   *   canActivate: [authGuard, roleGuard],
   *   data: { role: 'ADMIN' },
   *   loadChildren: () => ...
   * }
   *
   * No activar hasta confirmar el módulo/ruta real.
   */

  {
    path: '**',
    redirectTo: ''
  }
];