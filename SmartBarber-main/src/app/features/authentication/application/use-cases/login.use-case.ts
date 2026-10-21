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

import {
    AuthSession
} from '../../../../core/auth/model/auth-session.model';


@Injectable()
export class LoginUseCase {


    private readonly firebaseAuth =
        inject(FirebaseAuthService);


    private readonly sessionService =
        inject(SessionService);


    private readonly authRepository =
        inject(AuthRepository);


    async execute():
        Promise<AuthSession> {


        /*
         * =====================================================
         * 1. GOOGLE FIREBASE
         * =====================================================
         */

        const firebaseUser =
            await this.firebaseAuth
                .signInWithGoogle();


        /*
         * =====================================================
         * 2. VALIDAR FIREBASE TOKEN EN BACKEND
         * =====================================================
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

            

        return session;

    }

}