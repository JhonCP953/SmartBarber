import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivateFn,
    Router
} from '@angular/router';

import { SessionService } from '../services/session.service';
import { UserRole } from '../model/auth-session.model';

export const roleGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot
) => {

    const sessionService =
        inject(SessionService);

    const router =
        inject(Router);

    const session =
        sessionService.currentSession;

    if (!session) {
        return router.createUrlTree([
            '/auth/login'
        ]);
    }

    if (!sessionService.isActive()) {
        return router.createUrlTree([
            '/auth/login'
        ]);
    }

    const allowedRoles =
        route.data['roles'] as UserRole[] | undefined;

    if (!allowedRoles || allowedRoles.length === 0) {
        return true;
    }

    if (allowedRoles.includes(session.role)) {
        return true;
    }

    return router.createUrlTree([
        '/panel'
    ]);
};