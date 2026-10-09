import {
  HttpInterceptorFn
} from '@angular/common/http';

import {
  inject
} from '@angular/core';

import {
  from
} from 'rxjs';

import {
  switchMap
} from 'rxjs/operators';

import {
  FirebaseAuthService
} from '../services/firebase-auth.service';

export const firebaseTokenInterceptor:
  HttpInterceptorFn =
  (req, next) => {

    const auth =
      inject(FirebaseAuthService);

    return from(
      auth.getIdToken()
    )
    .pipe(

      switchMap(token => {

        if (!token) {
          return next(req);
        }

        if (
          req.headers.has(
            'Authorization'
          )
        ) {
          return next(req);
        }

        return next(
          req.clone({
            setHeaders: {
              Authorization:
                `Bearer ${token}`
            }
          })
        );
      })
    );
  };