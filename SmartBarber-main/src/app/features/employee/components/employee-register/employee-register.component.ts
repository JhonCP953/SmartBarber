import {
    CommonModule
} from '@angular/common';

import {
    Component,
    EventEmitter,
    Input,
    Output,
    inject
} from '@angular/core';

import {
    FormBuilder,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';

import {
    finalize
} from 'rxjs';

import {
    CreateEmployeeUseCase
} from '../../application/use-cases/create-employee.use-case';

import {
    EmployeeRegistration
} from '../../domain/models/employee-registration.model';

import {
    Employee
} from '../../domain/models/employee.model';

import {
    FirebaseAuthService
} from '../../../../core/auth/services/firebase-auth.service';

import {
    USER_ROLE_IDS
} from '../../../authentication/domain/models/user-role.model';

import {
    User
} from 'firebase/auth';

@Component({
    selector: 'app-employee-register',

    standalone: true,

    imports: [
        CommonModule,
        ReactiveFormsModule
    ],

    templateUrl:
        './employee-register.component.html',

    styleUrl:
        './employee-register.component.css'
})
export class EmployeeRegisterComponent {

    private readonly fb =
        inject(FormBuilder);

    private readonly createEmployee =
        inject(CreateEmployeeUseCase);

    private readonly firebaseAuth =
        inject(FirebaseAuthService);

    @Input()
    barberiaId = '';

    @Output()
    registered =
        new EventEmitter<Employee>();

    @Output()
    cancelled =
        new EventEmitter<void>();

    isSubmitting = false;

    isConnectingGoogle = false;

    successMessage = '';

    backendError = '';

    registrationUser: User | null = null;

    readonly specialties = [

        'Cortes',

        'Barba',

        'Colorimetría',

        'Tratamientos capilares'
    ];

    selectedSpecialties =
        new Set<string>();

    readonly form =
        this.fb.nonNullable.group({

            name: [
                '',
                [
                    Validators.required,
                    Validators.maxLength(120)
                ]
            ],

            documentType: [
                'CC' as 'CC' | 'CE',
                Validators.required
            ],

            document: [
                '',
                [
                    Validators.required,
                    Validators.maxLength(30)
                ]
            ],

            email: [
                '',
                [
                    Validators.required,
                    Validators.email
                ]
            ],

            cell: [
                '',
                [
                    Validators.required,
                    Validators.pattern(
                        /^[0-9]{10}$/
                    )
                ]
            ]
        });

    toggleSpecialty(
        specialty: string,
        checked: boolean
    ): void {

        if (checked) {

            this.selectedSpecialties.add(
                specialty
            );

        } else {

            this.selectedSpecialties.delete(
                specialty
            );
        }
    }

    async connectGoogleAccount(): Promise<void> {
        if (this.isConnectingGoogle || this.isSubmitting) {
            return;
        }

        this.backendError = '';
        this.registrationUser = null;
        this.form.controls.email.setValue('');
        this.isConnectingGoogle = true;

        try {
            await this.firebaseAuth
                .signOutEmployeeRegistration();

            const user =
                await this.firebaseAuth
                    .signInWithGoogleForEmployeeRegistration();

            if (!user.email) {
                await this.firebaseAuth
                    .signOutEmployeeRegistration();

                this.backendError =
                    'La cuenta de Google debe tener un correo electrónico para iniciar sesión.';

                return;
            }

            this.registrationUser = user;
            this.form.controls.email.setValue(
                user.email.trim().toLowerCase()
            );
        } catch (error: unknown) {
            this.backendError =
                this.getErrorMessage(error);
        } finally {
            this.isConnectingGoogle = false;
        }
    }

    async cancelRegistration(): Promise<void> {
        if (this.isSubmitting || this.isConnectingGoogle) {
            return;
        }

        if (this.registrationUser) {
            try {
                await this.firebaseAuth
                    .signOutEmployeeRegistration();
            } catch (error: unknown) {
                this.backendError =
                    this.getErrorMessage(error);

                return;
            }
        }

        this.cancelled.emit();
    }

    async submit(): Promise<void> {

        this.successMessage = '';

        this.backendError = '';

        if (
            this.form.invalid ||
            this.selectedSpecialties.size === 0
        ) {

            this.form.markAllAsTouched();

            return;
        }

        if (!this.registrationUser) {
            this.backendError =
                'Primero vincula la cuenta de Google que utilizará el barbero para iniciar sesión.';

            return;
        }

        if (!this.barberiaId) {

            this.backendError =
                'No fue posible identificar la barbería de esta sesión.';

            return;
        }

        const value =
            this.form.getRawValue();

        const request:
            EmployeeRegistration = {

            user: {
                roleId: USER_ROLE_IDS.BARBER
            },

            employee: {
                barberiaId:
                    this.barberiaId,

                name:
                    value.name.trim(),

                document:
                    value.document.trim(),

                documentType:
                    value.documentType,

                cell:
                    value.cell.trim(),

                email:
                    value.email
                        .trim()
                        .toLowerCase(),

                specialty:
                    Array.from(
                        this.selectedSpecialties
                    ).join(', ')
            }
        };

        this.isSubmitting = true;

        let idToken: string;

        try {
            idToken =
                await this.registrationUser.getIdToken();

            await this.firebaseAuth
                .signOutEmployeeRegistration();

            this.registrationUser = null;
            this.form.controls.email.setValue('');
        } catch (error: unknown) {
            this.backendError =
                this.getErrorMessage(error);

            this.isSubmitting = false;

            return;
        }

        this.createEmployee
            .execute(request, idToken)

            .pipe(
                finalize(
                    () =>
                        this.isSubmitting = false
                )
            )

            .subscribe({

                next: employee => {

                    this.successMessage =
                        'Barbero registrado correctamente. Podrá iniciar sesión con la cuenta de Google vinculada.';

                    this.registered.emit(
                        employee
                    );

                    this.form.reset({

                        name: '',

                        documentType: 'CC',

                        document: '',

                        email: '',

                        cell: ''
                    });

                    this.selectedSpecialties.clear();
                },

                error: error => {

                    this.backendError =
                        this.getErrorMessage(error);
                }
            });
    }

    private getErrorMessage(error: unknown): string {
        if (typeof error === 'object' && error !== null) {
            if ('error' in error) {
                const responseBody = error.error;

                if (
                    typeof responseBody === 'object' &&
                    responseBody !== null
                ) {
                    if (
                        'data' in responseBody &&
                        typeof responseBody.data === 'object' &&
                        responseBody.data !== null &&
                        'message' in responseBody.data &&
                        typeof responseBody.data.message === 'string'
                    ) {
                        return responseBody.data.message;
                    }

                    if (
                        'message' in responseBody &&
                        typeof responseBody.message === 'string'
                    ) {
                        return responseBody.message;
                    }
                }
            }

            if ('code' in error && typeof error.code === 'string') {
                if (error.code === 'auth/popup-closed-by-user') {
                    return 'Se cerró la ventana de Google antes de vincular la cuenta.';
                }

                if (error.code === 'auth/popup-blocked') {
                    return 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo de nuevo.';
                }
            }

            if ('message' in error && typeof error.message === 'string') {
                return error.message;
            }
        }

        return 'No fue posible completar el registro del barbero. Inténtalo nuevamente.';
    }
}