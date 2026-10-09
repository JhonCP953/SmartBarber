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
    BackendRole
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

        const firebaseUser =
            await this.firebaseAuth.signInWithGoogle();

        const backendRole =
            await firstValueFrom(
                this.authRepository
                    .verifyAuthentication()
            );

        const role =
            this.mapRole(
                backendRole
            );

        const previousSession =
            this.sessionService.currentSession;

        const sameUser =
            previousSession?.firebaseUid ===
            firebaseUser.uid;

        const session: AuthSession = {

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

        this.sessionService.setSession(
            session
        );

        return session;
    }

    private mapRole(
        role: BackendRole
    ): UserRole {

        switch (role) {

            case 'Cliente':
                return 'CLIENT';

            case 'Barbero':
                return 'BARBER';

            case 'Administrador':
                return 'ADMIN';
        }
    }
}