import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';

import { SessionService } from '../../../core/auth/services/session.service';
import { BarbershopSubscriptionAccessService } from '../../subscription/application/services/barbershop-subscription-access.service';

export const barbershopSubscriptionGuard: CanActivateChildFn = (
  _route,
  state
) => {
  const session = inject(SessionService).currentSession;
  const access = inject(BarbershopSubscriptionAccessService);
  const router = inject(Router);

  if (
    !session ||
    (session.role !== 'ADMIN' && session.role !== 'BARBER') ||
    !access.restrictsModules
  ) {
    return true;
  }

  if (
    state.url === '/panel' ||
    state.url.startsWith('/panel/home') ||
    state.url.startsWith('/panel/profile') ||
    state.url.startsWith('/panel/subscription/status')
  ) {
    return true;
  }

  return router.createUrlTree([
    session.role === 'ADMIN'
      ? '/panel/subscription/status'
      : '/panel/home'
  ]);
};
