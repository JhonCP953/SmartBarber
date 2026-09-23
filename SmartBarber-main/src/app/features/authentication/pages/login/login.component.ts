import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { LoginUseCase } from
    '../../application/use-cases/login.use-case';

import { FirebaseAuthService } from
    '../../../../core/auth/services/firebase-auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {

    private readonly loginUseCase = inject(LoginUseCase);
    private readonly firebaseAuth = inject(FirebaseAuthService);
    private readonly router = inject(Router);

    loading = false;
    errorMessage = '';

    async loginWithGoogle(): Promise<void> {

        if (this.loading) {
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        try {
            const session = await this.loginUseCase.execute();

            if (session.role === 'CLIENT') {
                await this.router.navigate(['/']);
                return;
            }

            if (session.role === 'ADMIN') {
                /*
                 * Ajustar cuando esté definida la ruta
                 * definitiva del dashboard administrativo.
                 */
                await this.router.navigate(['/']);
            }

        } catch (error: unknown) {

            const message =
                error instanceof Error ? error.message : '';

            switch (message) {
                case 'USER_BLOCKED':
                    this.errorMessage =
                        'Tu cuenta se encuentra bloqueada. Comunícate con soporte.';
                    break;

                case 'USER_INACTIVE':
                    this.errorMessage =
                        'Tu cuenta no está activa. Comunícate con soporte.';
                    break;

                case 'INVALID_ROLE':
                    this.errorMessage =
                        'No fue posible identificar el rol de tu cuenta.';
                    break;

                case 'FIREBASE_UID_MISMATCH':
                    this.errorMessage =
                        'No fue posible validar tu identidad.';
                    break;

                default:
                    this.errorMessage =
                        'No fue posible iniciar sesión. Inténtalo nuevamente.';
            }

        } finally {
            this.loading = false;
        }
    }

    async goToRegister(): Promise<void> {
        await this.router.navigate(['/auth/register']);
    }

    async goToAdminRegister(): Promise<void> {
        await this.router.navigate(['/auth/register-admin']);
    }
}