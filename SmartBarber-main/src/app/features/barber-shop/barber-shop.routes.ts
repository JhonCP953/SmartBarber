import {
    Routes
} from '@angular/router';

import {
    authGuard
} from '../../core/auth/guards/auth.guard';

import {
    roleGuard
} from '../../core/auth/guards/role.guard';

export const BARBER_SHOP_ROUTES: Routes = [
    {
        path: '',
        canActivate: [
            authGuard,
            roleGuard
        ],
        data: {
            roles: [
                'ADMIN'
            ]
        },
        loadComponent: () =>
            import('./components/branch-register/branch-register.component')
            .then(
                m =>
                    m.BranchRegisterComponent
            )
    },
  {
    path: '',
    loadComponent: () =>
      import('./components/branch-register/branch-register.component')
        .then(m => m.BranchRegisterComponent)
  },
 {
        path: 'configuracion',
        loadComponent: () =>
            import('./components/configuration/config.component')
                .then(m => m.BarberConfigComponent)
    },
  {
        path: 'politicas-cancelacion',
        loadComponent: () =>
          import('../../features/barber-shop/components/cancellation-policies/cancellation-policies.component')
            .then(m => m.CancellationPoliciesComponent)
    },
    {
        path: 'canales-contacto',
        loadComponent: () =>
          import('../../features/barber-shop/components/contact-channels/contact-channels.component')
            .then(m => m.ContactChannelsComponent)
    },
    {
    path: 'CRUD-Servicios',
    loadComponent: () =>
      import('./components/crud-servicios/Create-service/crud-servicios.component')
        .then(m => m.BarberServiConfigComponent)
  }

];