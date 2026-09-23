import {
    Component,
    computed,
    inject,
    signal
} from '@angular/core';

import {
    CommonModule
} from '@angular/common';

import {
    FormBuilder,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';

import {
    Router
} from '@angular/router';

import {
    RegisterAdminUseCase
} from '../../application/use-cases/register-admin.use-case';

import {
    FirebaseAuthService
} from '../../../../core/auth/services/firebase-auth.service';

@Component({
    selector: 'app-register-admin',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    templateUrl: './register-admin.component.html',
    styleUrl: './register-admin.component.css'
})
export class RegisterAdminComponent {

    private readonly fb = inject(FormBuilder);

    private readonly router = inject(Router);

    private readonly registerAdminUseCase =
        inject(RegisterAdminUseCase);

    private readonly firebaseAuthService =
        inject(FirebaseAuthService);

    readonly loading = signal(false);

    readonly success = signal(false);

    readonly errorMessage = signal('');

    readonly firebaseUser =
        this.firebaseAuthService.getCurrentUser();

    readonly adminForm = this.fb.nonNullable.group({

        name: [
            '',
            [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(100)
            ]
        ],

        cell: [
            '',
            [
                Validators.required,
                Validators.pattern(/^[0-9]{10}$/)
            ]
        ]

    });

    readonly barberShopForm = this.fb.nonNullable.group({

        name: [
            '',
            [
                Validators.required,
                Validators.minLength(3)
            ]
        ],

        description: [
            '',
            [
                Validators.required,
                Validators.maxLength(500)
            ]
        ],

        location: [
            '',
            [
                Validators.required
            ]
        ],

        phone: [
            '',
            [
                Validators.required,
                Validators.pattern(/^[0-9]{10}$/)
            ]
        ],

        document: [
            '',
            [
                Validators.required,
                Validators.minLength(5)
            ]
        ],

        documentType: [
            'NIT',
            [
                Validators.required
            ]
        ],

        companyName: [
            '',
            [
                Validators.required,
                Validators.minLength(3)
            ]
        ]

    });

    readonly email = computed(
        () => this.firebaseUser?.email ?? ''
    );

    get name() {
        return this.adminForm.controls.name;
    }

    get cell() {
        return this.adminForm.controls.cell;
    }

    get barberShopName() {
        return this.barberShopForm.controls.name;
    }

    get barberShopDescription() {
        return this.barberShopForm.controls.description;
    }

    get location() {
        return this.barberShopForm.controls.location;
    }

    get phone() {
        return this.barberShopForm.controls.phone;
    }

    get document() {
        return this.barberShopForm.controls.document;
    }

    get documentType() {
        return this.barberShopForm.controls.documentType;
    }

    get companyName() {
        return this.barberShopForm.controls.companyName;
    }

    submit(): void {

        this.errorMessage.set('');

        if (this.loading()) {
            return;
        }

        if (
            this.adminForm.invalid ||
            this.barberShopForm.invalid
        ) {

            this.adminForm.markAllAsTouched();

            this.barberShopForm.markAllAsTouched();

            this.errorMessage.set(
                'Por favor completa correctamente todos los campos obligatorios.'
            );

            return;
        }

        if (!this.firebaseUser) {

            this.errorMessage.set(
                'Debes iniciar sesión con Google antes de continuar.'
            );

            return;
        }

        this.loading.set(true);

        const adminData = this.adminForm.getRawValue();

        const barberShopData =
            this.barberShopForm.getRawValue();

        this.registerAdminUseCase
            .execute(
                adminData,
                barberShopData
            )
            .subscribe({

                next: () => {

                    this.loading.set(false);

                    this.success.set(true);

                    setTimeout(() => {
                        this.router.navigate(['/']);
                    }, 2000);
                },

                error: (error) => {

                    console.error(
                        'Error durante el registro del administrador:',
                        error
                    );

                    this.loading.set(false);

                    this.errorMessage.set(
                        this.getErrorMessage(error)
                    );
                }

            });
    }

    private getErrorMessage(error: any): string {

        if (
            error?.error?.message
        ) {
            return error.error.message;
        }

        if (
            error?.message
        ) {
            return error.message;
        }

        return 'No fue posible completar el registro. Intenta nuevamente.';
    }
}