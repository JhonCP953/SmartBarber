import {
    inject
} from '@angular/core';

import {
    CanActivateFn,
    Router
} from '@angular/router';

import {
    SessionService
} from '../services/session.service';

export const authGuard: CanActivateFn = () => {

    const sessionService =
        inject(SessionService);

    const router =
        inject(Router);


    const session =
        sessionService.currentSession;


    if (
        session &&
        session.status === 'ACTIVE'
    ) {
        return true;
    }


    sessionService.clearSession();


    return router.createUrlTree([
        '/auth/login'
    ]);
};