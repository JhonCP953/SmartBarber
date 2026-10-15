
import { Routes } from '@angular/router';

import { authGuard } from '../../core/auth/guards/auth.guard';
import { roleGuard } from '../../core/auth/guards/role.guard';
import { panelEntryGuard } from './guards/panel-entry.guard';
import { PanelNavigationService } from './application/services/panel-navigation.service';

export const PANEL_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    providers: [PanelNavigationService],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
      },
      {
        path: 'home',
        canActivate: [panelEntryGuard],
        loadComponent: () =>
          import('./pages/panel/panel.component')
            .then(m => m.PanelComponent)
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadChildren: () =>
          import('../profile/profile.routes')
            .then(m => m.PROFILE_ROUTES)
      },
      {
        path: 'barbershop',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('../barber-shop/components/configuration/config.component')
            .then(m => m.BarberConfigComponent)
      },
      {
        path: 'users',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () =>
          import('../user-management/user-management.routes')
            .then(m => m.USER_MANAGEMENT_ROUTES)
      },
      {
        path: 'subscription',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () =>
          import('../subscription/subscription.routes')
            .then(m => m.SUBSCRIPTION_ROUTES)
      }
    ]
  }
];
