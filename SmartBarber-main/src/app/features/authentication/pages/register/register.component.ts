import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal
} from '@angular/core';

import {
    FormBuilder,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';

import { FirebaseAuthService } from '../../../../core/auth/services/firebase-auth.service';

import { RegisterClientUseCase } from '../../application/use-cases/register-client.use-case';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {

    private readonly formBuilder = inject(FormBuilder);

    private readonly router = inject(Router);

    private readonly firebaseAuth =
        inject(FirebaseAuthService);

    private readonly registerClient =
        inject(RegisterClientUseCase);

    readonly currentUser =
        signal(this.firebaseAuth.getCurrentUser());

    readonly selectedRole =
        signal<'CLIENT' | 'BARBER_SHOP' | null>(null);

    readonly loadingGoogle =
        signal(false);

    readonly submitting =
        signal(false);

    readonly successMessage =
        signal('');

    readonly errorMessage =
        signal('');

    readonly googleAuthenticated =
        computed(() => !!this.currentUser());

    readonly clientSelected =
        computed(() => this.selectedRole() === 'CLIENT');

    readonly clientForm =
        this.formBuilder.nonNullable.group({

            name: [
                '',
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(100)
                ]
            ],

            documentType: [
                'CC',
                [
                    Validators.required
                ]
            ],

            document: [
                '',
                [
                    Validators.required,
                    Validators.pattern(/^[0-9]{6,15}$/)
                ]
            ],

            cell: [
                '',
                [
                    Validators.required,
                    Validators.pattern(/^3[0-9]{9}$/)
                ]
            ]
        });

    async continueWithGoogle(): Promise<void> {

        this.loadingGoogle.set(true);
        this.errorMessage.set('');
        this.successMessage.set('');

        try {

            const user =
                await this.firebaseAuth.signInWithGoogle();

            this.currentUser.set(user);

        } catch (error) {

            console.error(
                'Error de autenticación con Google:',
                error
            );

            this.errorMessage.set(
                this.getFirebaseErrorMessage(error)
            );

        } finally {

            this.loadingGoogle.set(false);
        }
    }

    selectRole(
        role: 'CLIENT' | 'BARBER_SHOP'
    ): void {

        this.selectedRole.set(role);

        this.errorMessage.set('');
        this.successMessage.set('');

        if (role === 'BARBER_SHOP') {

            this.router.navigate(['auth/register-admin']);

            return;
        }

        this.clientForm.reset({
            name:
                this.currentUser()?.displayName ?? '',

            documentType: 'CC',

            document: '',

            cell: ''
        });
    }


    submitClientRegistration(): void {

        this.errorMessage.set('');
        this.successMessage.set('');

        if (!this.currentUser()) {

            this.errorMessage.set(
                'Continúa con Google antes de registrarte.'
            );

            return;
        }

        if (this.clientForm.invalid) {

            this.clientForm.markAllAsTouched();

            this.errorMessage.set(
                'Corrige los campos resaltados.'
            );

            return;
        }

        this.submitting.set(true);

        this.registerClient
            .execute(this.clientForm.getRawValue())
            .subscribe({

                next: () => {

                    this.successMessage.set(
                        'Tu cuenta de cliente ha sido registrada correctamente.'
                    );

                    /*
                     * The user is already authenticated with Firebase,
                     * so there is no need to redirect to a login page.
                     */
                    setTimeout(() => {
                        this.router.navigate(['/']);
                    }, 1200);
                },

                error: (error) => {

                    console.error(
                        'Error en el registro del cliente:',
                        error
                    );

                    this.errorMessage.set(
                        this.getBackendErrorMessage(error)
                    );

                    this.submitting.set(false);
                },

                complete: () => {
                    this.submitting.set(false);
                }
            });
    }

    hasError(
        controlName: string,
        errorName: string
    ): boolean {

        const control =
            this.clientForm.get(controlName);

        return !!(
            control &&
            control.touched &&
            control.hasError(errorName)
        );
    }

    getFirebaseErrorMessage(error: unknown): string {

        const firebaseError =
            error as { code?: string };

        switch (firebaseError.code) {

            case 'auth/popup-closed-by-user':
                return 'La ventana de autenticación de Google fue cerrada.';

            case 'auth/popup-blocked':
                return 'El navegador bloqueó la ventana de autenticación de Google.';

            case 'auth/cancelled-popup-request':
                return 'La solicitud de autenticación de Google fue cancelada.';

            case 'auth/account-exists-with-different-credential':
                return 'Este correo electrónico ya está asociado con otro método de autenticación.';

            case 'auth/network-request-failed':
                return 'Ocurrió un error de red. Inténtalo nuevamente.';

            default:
                return 'No fue posible autenticarte con Google. Inténtalo nuevamente.';
        }
    }

    getBackendErrorMessage(error: any): string {

        const status = error?.status;

        if (status === 400) {
            return 'La información del cliente proporcionada no es válida.';
        }

        if (status === 409) {
            return 'Ya existe un cliente con esta información.';
        }

        if (status === 401) {
            return 'La sesión de autenticación no es válida.';
        }

        if (status === 403) {
            return 'No tienes autorización para realizar esta operación.';
        }

        if (status >= 500) {
            return 'El servidor no pudo completar el registro. Inténtalo nuevamente más tarde.';
        }

        return (
            error?.error?.message ??
            'Ocurrió un error inesperado durante el registro.'
        );
    }
}