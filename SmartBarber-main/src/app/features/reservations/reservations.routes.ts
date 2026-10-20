import { Routes } from '@angular/router';

export const RESERVATION_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./components/appointment/appointment.component')
                .then(m => m.AppointmentComponent)
    }
];