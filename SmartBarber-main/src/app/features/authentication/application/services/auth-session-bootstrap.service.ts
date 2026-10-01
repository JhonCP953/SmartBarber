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
    AuthProfileResponse
} from '../../domain/models/auth-session.model';

import {
    AuthSession
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

            const profile =
                await firstValueFrom(
                    this.authRepository
                        .getAuthenticatedProfile()
                );


            if (
                profile.status !== 'ACTIVE' ||
                !this.isValidRole(profile.role) ||
                (
                    profile.firebaseUid &&
                    profile.firebaseUid !==
                    firebaseUser.uid
                )
            ) {

                await this.firebaseAuth.logout();

                this.sessionService.clearSession();

                return;
            }


            this.sessionService.setSession(
                this.toSession(
                    profile,
                    firebaseUser.uid,
                    firebaseUser.email,
                    firebaseUser.displayName,
                    firebaseUser.photoURL
                )
            );

        } catch {

            this.sessionService.clearSession();
        }
    }


    private isValidRole(
        role: AuthProfileResponse['role']
    ): boolean {

        return (
            role === 'CLIENT' ||
            role === 'ADMIN' ||
            role === 'BARBER'
        );
    }


    private toSession(
        profile: AuthProfileResponse,
        firebaseUid: string,
        firebaseEmail: string | null,
        firebaseDisplayName: string | null,
        firebasePhotoUrl: string | null
    ): AuthSession {

        return {

            userId:
                profile.userId,

            clientId:
                profile.clientId ?? null,

            firebaseUid,

            email:
                profile.email ||
                firebaseEmail ||
                '',

            displayName:
                profile.displayName ||
                firebaseDisplayName ||
                '',

            role:
                profile.role,

            status:
                profile.status,

            tenantId:
                profile.tenantId ?? null,

            photoUrl:
                profile.photoUrl ??
                firebasePhotoUrl,

            barberId:
                profile.barberId ?? null,

            barbershopId:
                profile.barbershopId ?? null
        };
    }
}