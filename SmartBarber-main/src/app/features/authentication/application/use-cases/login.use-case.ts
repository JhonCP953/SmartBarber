import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { FirebaseAuthService } from
    '../../../../core/auth/services/firebase-auth.service';

import { SessionService } from
    '../../../../core/auth/services/session.service';

import { AuthRepository } from
    '../../domain/repositories/auth.repository';

import { AuthSession } from
    '../../../../core/auth/model/auth-session.model';

@Injectable()
export class LoginUseCase {

    private readonly firebaseAuth = inject(FirebaseAuthService);
    private readonly sessionService = inject(SessionService);
    private readonly authRepository = inject(AuthRepository);

    async execute(): Promise<AuthSession> {

        const firebaseUser =
            await this.firebaseAuth.signInWithGoogle();

        if (!firebaseUser) {
            throw new Error('FIREBASE_AUTH_FAILED');
        }

        const profile = await firstValueFrom(
            this.authRepository.getAuthenticatedProfile()
        );

        if (profile.status === 'BLOCKED') {
            await this.firebaseAuth.logout();
            this.sessionService.clearSession();

            throw new Error('USER_BLOCKED');
        }

        if (profile.status !== 'ACTIVE') {
            await this.firebaseAuth.logout();
            this.sessionService.clearSession();

            throw new Error('USER_INACTIVE');
        }

        if (
            profile.firebaseUid &&
            profile.firebaseUid !== firebaseUser.uid
        ) {
            await this.firebaseAuth.logout();
            this.sessionService.clearSession();

            throw new Error('FIREBASE_UID_MISMATCH');
        }

        if (
            profile.role !== 'CLIENT' &&
            profile.role !== 'ADMIN'
        ) {
            await this.firebaseAuth.logout();
            this.sessionService.clearSession();

            throw new Error('INVALID_ROLE');
        }

        const session: AuthSession = {
            userId: profile.userId,
            firebaseUid: firebaseUser.uid,
            email: profile.email || firebaseUser.email || '',
            displayName:
                profile.displayName || firebaseUser.displayName || '',
            role: profile.role,
            status: profile.status,
            tenantId: profile.tenantId ?? null,
            photoUrl: profile.photoUrl ?? firebaseUser.photoURL
        };

        this.sessionService.setSession(session);

        return session;
    }
}