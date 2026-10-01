import {
    Routes
} from '@angular/router';

import {
    authGuard
} from '../../core/auth/guards/auth.guard';

import {
    roleGuard
} from '../../core/auth/guards/role.guard';

import {
    PanelNavigationService
} from './application/services/panel-navigation.service';


export const PANEL_ROUTES: Routes = [

    {
        path: '',

        canActivate: [
            authGuard
        ],

        providers: [
            PanelNavigationService
        ],

        children: [

            {
                path: '',

                loadComponent: () =>
                    import(
                        './pages/panel/panel.component'
                    ).then(
                        m =>
                            m.PanelComponent
                    )
            },

            {
                path: 'users',

                canActivate: [
                    authGuard,
                    roleGuard
                ],

                data: {
                    roles: [
                        'ADMIN'
                    ]
                },

                loadChildren: () =>
                    import(
                        '../user-management/user-management.routes'
                    ).then(
                        m =>
                            m.USER_MANAGEMENT_ROUTES
                    )
            }
        ]
    }
];