import {
    Routes
} from '@angular/router';

import {
    authGuard
} from '../../core/auth/guards/auth.guard';

import {
    ProfileRepository
} from './domain/repositories/profile.repository';

import {
    ProfileApiService
} from './infrastructure/api/profile-api.service';

import {
    GetProfileUseCase
} from './application/use-cases/get-profile.use-case';

import {
    UpdateProfileUseCase
} from './application/use-cases/update-profile.use-case';


export const PROFILE_ROUTES: Routes = [

    // =========================
    // PERFIL
    // =========================
    {
        path: '',

        canActivate: [
            authGuard
        ],

        providers: [

            {
                provide:
                    ProfileRepository,

                useClass:
                    ProfileApiService
            },

            GetProfileUseCase,

            UpdateProfileUseCase
        ],

        loadComponent: () =>
            import(
                './pages/profile/profile.component'
            ).then(
                m => m.ProfileComponent
            )
    }

];