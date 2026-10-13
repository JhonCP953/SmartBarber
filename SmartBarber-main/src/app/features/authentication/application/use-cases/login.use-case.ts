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
    AuthSession,
    UserRole
} from '../../../../core/auth/model/auth-session.model';

import {
    BackendRoleResponse
} from '../../domain/models/auth-session.model';


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

        const backendRole =
            await firstValueFrom(
                this.authRepository
                    .verifyAuthentication()
            );


        /*
         * =====================================================
         * 3. MAPEAR ROLE
         * =====================================================
         */

        const role =
            this.mapRole(
                backendRole
            );


        /*
         * =====================================================
         * 4. RECUPERAR INFORMACIÓN DE SESIÓN PREVIA
         * =====================================================
         */

        const previousSession =
            this.sessionService
                .currentSession;


        const sameUser =
            previousSession?.firebaseUid ===
            firebaseUser.uid;


        /*
         * =====================================================
         * 5. CREAR SESIÓN
         * =====================================================
         */

        const session:
            AuthSession = {

            userId:
                sameUser
                    ? previousSession?.userId ?? ''
                    : '',

            clientId:
                sameUser
                    ? previousSession?.clientId ?? null
                    : null,

            firebaseUid:
                firebaseUser.uid,

            email:
                firebaseUser.email ?? '',

            displayName:
                firebaseUser.displayName ?? '',

            role,

            status:
                'ACTIVE',

            tenantId:
                sameUser
                    ? previousSession?.tenantId ?? null
                    : null,

            photoUrl:
                firebaseUser.photoURL ?? null,

            barberId:
                sameUser
                    ? previousSession?.barberId ?? null
                    : null,

            barbershopId:
                sameUser
                    ? previousSession?.barbershopId ?? null
                    : null

        };


        this.sessionService
            .setSession(
                session
            );


        return session;

    }


    private mapRole(
        role: BackendRoleResponse
    ):
        UserRole {


        switch (role) {


            /*
             * Backend actual
             */

            case 'CUSTOMER':

                return 'CLIENT';


            case 'BARBER':

                return 'BARBER';


            case 'ADMIN':

                return 'ADMIN';


            /*
             * Compatibilidad con backend anterior
             */

            case 'Cliente':

                return 'CLIENT';


            case 'Barbero':

                return 'BARBER';


            case 'Administrador':

                return 'ADMIN';


            default:

                throw new Error(
                    'INVALID_ROLE'
                );

        }

    }

}