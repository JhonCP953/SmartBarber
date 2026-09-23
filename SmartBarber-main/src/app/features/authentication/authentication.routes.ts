import { Routes } from '@angular/router';

import { ClientRegistrationRepository } from './domain/repositories/client-registration.repository';
import { ClientRegistrationApiService } from './infrastructure/api/client-registration-api.service';
import { RegisterClientUseCase } from './application/use-cases/register-client.use-case';

import { AdminRegistrationRepository } from './domain/repositories/admin-registration.repository';
import { AdminRegistrationApiService } from './infrastructure/api/admin-registration-api.service';
import { RegisterAdminUseCase } from './application/use-cases/register-admin.use-case';

export const AUTHENTICATION_ROUTES: Routes = [
  // =========================
  // REGISTRO DE CLIENTE
  // =========================
  {
    path: 'register',

    providers: [

      {
        provide: ClientRegistrationRepository,
        useClass: ClientRegistrationApiService
      },

      RegisterClientUseCase

    ],

    loadComponent: () =>
      import('./pages/register/register.component')
        .then(
          m => m.RegisterComponent
        )
  },

  // =========================
  // REGISTRO DE ADMINISTRADOR
  // =========================
  {
    path: 'register-admin',

    providers: [

      {
        provide: AdminRegistrationRepository,
        useClass: AdminRegistrationApiService
      },

      RegisterAdminUseCase

    ],

    loadComponent: () =>
      import('./pages/register-admin/register-admin.component')
        .then(
          m => m.RegisterAdminComponent
        )
  }

];