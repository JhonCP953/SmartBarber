
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../../../core/auth/services/session.service';

export const panelEntryGuard: CanActivateFn = () => {
  const sessionService = inject(SessionService);
  const router = inject(Router);
  const session = sessionService.currentSession;

  if (!session || session.status !== 'ACTIVE') {
    sessionService.clearSession();
    return router.createUrlTree(['/auth/login']);
  }

  return true;
};
