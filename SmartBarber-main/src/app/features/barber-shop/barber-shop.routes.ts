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
            import(
                './components/branch-register/branch-register.component'
            )
            .then(
                m =>
                    m.BranchRegisterComponent
            )
    }

];