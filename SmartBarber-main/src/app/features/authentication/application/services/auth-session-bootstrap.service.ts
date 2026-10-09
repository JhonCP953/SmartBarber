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
    BackendRole
} from '../../domain/models/auth-session.model';

import {
    AuthSession,
    UserRole
} from '../../../../core/auth/model/auth-session.model';

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

    async restore(): Promise<void> {

        const firebaseUser =
            await this.firebaseAuth.waitForAuthState();

        if (!firebaseUser) {

            this.sessionService.clearSession();

            return;
        }

        try {

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

            const sameFirebaseUser =
                previousSession?.firebaseUid ===
                firebaseUser.uid;

            const session: AuthSession = {

                userId:
                    sameFirebaseUser
                        ? previousSession?.userId ?? ''
                        : '',

                clientId:
                    sameFirebaseUser
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
                    sameFirebaseUser
                        ? previousSession?.tenantId ?? null
                        : null,

                photoUrl:
                    firebaseUser.photoURL ?? null,

                barberId:
                    sameFirebaseUser
                        ? previousSession?.barberId ?? null
                        : null,

                barbershopId:
                    sameFirebaseUser
                        ? previousSession?.barbershopId ?? null
                        : null
            };

            this.sessionService.setSession(
                session
            );

        } catch {

            this.sessionService.clearSession();
        }
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