import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { firebaseTokenInterceptor } from './core/auth/interceptors/firebase-token.interceptor';

import { AuthRepository } from './features/authentication/domain/repositories/auth.repository';
import { AuthApiService } from './features/authentication/infrastructure/api/auth-api.service';
import { AuthSessionBootstrapService } from './features/authentication/application/services/auth-session-bootstrap.service';

function initializeAuthSession(
  bootstrapService: AuthSessionBootstrapService
): () => Promise<void> {
  return () => bootstrapService.restore();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'top'
      })
    ),

    provideHttpClient(
      withInterceptors([
        firebaseTokenInterceptor
      ])
    ),

    {
      provide: AuthRepository,
      useClass: AuthApiService
    },

    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuthSession,
      deps: [AuthSessionBootstrapService],
      multi: true
    }
  ]
};