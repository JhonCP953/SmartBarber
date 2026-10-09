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
<<<<<<< HEAD

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
            import(
                './components/branch-register/branch-register.component'
            )
            .then(
                m =>
                    m.BranchRegisterComponent
            )
    }

=======
  {
    path: '',
    loadComponent: () =>
      import('./components/branch-register/branch-register.component')
        .then(m => m.BranchRegisterComponent)
  },
  {
    path: 'configuracion',
    loadComponent: () =>
      import('./components/config/config.component')
        .then(m => m.BarberConfigComponent)
  }
>>>>>>> 6ff7c7f ( edicion y consulta de barberias)
];