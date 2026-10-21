import {
    Injectable,
    inject
} from '@angular/core';

import {
    firstValueFrom
} from 'rxjs';

import {
    FirebaseAuthService
} from '../../../../core/auth/services/firebase-auth.service';

import {
    SessionService
} from '../../../../core/auth/services/session.service';

import {
    AuthRepository
} from '../../domain/repositories/auth.repository';

import {
    mapBackendAuthentication
} from '../mapper/auth-session.mapper';


@Injectable({
    providedIn: 'root'
})
export class AuthSessionBootstrapService {


    private readonly firebaseAuth =
        inject(FirebaseAuthService);


    private readonly sessionService =
        inject(SessionService);


    private readonly authRepository =
        inject(AuthRepository);


    async restore():
        Promise<void> {


        /*
         * =====================================================
         * ESPERAR ESTADO DE FIREBASE
         * =====================================================
         */

        const firebaseUser =
            await this.firebaseAuth
                .waitForAuthState();


        if (!firebaseUser) {

            this.sessionService
                .clearSession();

            return;
        }


        try {


            /*
             * =================================================
             * VALIDAR USUARIO CONTRA BACKEND
             * =================================================
             */

            const backendAuthentication =
                await firstValueFrom(
                    this.authRepository
                        .verifyAuthentication()
                );

            const session = mapBackendAuthentication(
                backendAuthentication,
                firebaseUser
            );


            this.sessionService
                .setSession(
                    session
                );


        } catch (error: unknown) {

            /*
             * Si Firebase tiene sesión pero el usuario no
             * existe en SmartBarber, no debemos mantener una
             * sesión interna falsa.
             */

            this.sessionService
                .clearSession();

            console.error(
                'No fue posible restaurar la sesión autenticada:',
                error
            );
        }

    }

}