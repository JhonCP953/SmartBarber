import { inject } from '@angular/core';
import {
    CanActivateFn,
    Router
} from '@angular/router';

import { SessionService } from '../services/session.service';
import { UserRole } from '../model/auth-session.model';

export const roleGuard: CanActivateFn = (route) => {

    const sessionService = inject(SessionService);
    const router = inject(Router);

    const requiredRole =
        route.data['role'] as UserRole | undefined;

    if (
        !sessionService.isAuthenticated() ||
        !sessionService.isActive()
    ) {
        return router.createUrlTree(['/auth/login']);
    }

    if (
        requiredRole &&
        !sessionService.hasRole(requiredRole)
    ) {
        return router.createUrlTree(['/']);
    }

    return true;
};