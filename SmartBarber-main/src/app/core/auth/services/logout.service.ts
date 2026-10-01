import {
    Injectable,
    inject
} from '@angular/core';

import { Router } from '@angular/router';

import { FirebaseAuthService } from './firebase-auth.service';
import { SessionService } from './session.service';

@Injectable({
    providedIn: 'root'
})
export class LogoutService {

    private readonly firebaseAuth =
        inject(FirebaseAuthService);

    private readonly sessionService =
        inject(SessionService);

    private readonly router =
        inject(Router);


    private readonly storageKeys: string[] = [
        'smartbarber.session',
        'smartbarber.user',
        'smartbarber.auth',
        'smartbarber.profile',
        'smartbarber.token'
    ];


    async execute(): Promise<void> {

        try {

            await this.firebaseAuth.logout();

        } finally {

            this.sessionService.clearSession();

            this.clearSensitiveStorage();

            await this.router.navigate(
                ['/auth/login'],
                {
                    replaceUrl: true
                }
            );
        }
    }


    private clearSensitiveStorage(): void {

        for (const key of this.storageKeys) {

            try {
                localStorage.removeItem(key);
            } catch {
                // Storage may be unavailable.
            }

            try {
                sessionStorage.removeItem(key);
            } catch {
                // Storage may be unavailable.
            }
        }

        try {
            sessionStorage.clear();
        } catch {
            // Storage may be unavailable.
        }
    }
}