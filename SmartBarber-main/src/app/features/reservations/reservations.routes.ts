import { Routes } from '@angular/router';

export const RESERVATION_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./components/appointment/appointment.component')
                .then(m => m.RerservarionComponent)
    }
   
];
    // {
    //     path: '',
    //     loadComponent: () =>
    //         import('./pages/reservation-list/reservation-list.component')
    //             .then(m => m.ReservationListComponent)
    // },

    // {
    //     path: 'nueva',
    //     loadComponent: () =>
    //         import('./pages/reservation-create/reservation-create.component')
    //             .then(m => m.ReservationCreateComponent)
    // },