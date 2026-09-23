import { HttpInterceptorFn } from '@angular/common/http';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { inject } from '@angular/core';
import { FirebaseAuthService } from '../services/firebase-auth.service';

export const firebaseTokenInterceptor: HttpInterceptorFn =
  (req, next) => {

    const authService = inject(FirebaseAuthService);

    return from(authService.getIdToken()).pipe(
      switchMap((token) => {

        if (!token) {
          return next(req);
        }

        const authenticatedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });

        return next(authenticatedRequest);
      })
    );
  };