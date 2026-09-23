import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import {
    FormBuilder,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { finalize } from 'rxjs';

import { CreateEmployeeUseCase } from '../../application/use-cases/create-employee.use-case';
import { EmployeeRegistration } from '../../domain/models/employee-registration.model';
import { Employee } from '../../domain/models/employee.model';

@Component({
    selector: 'app-employee-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './employee-register.component.html',
    styleUrl: './employee-register.component.css'
})
export class EmployeeRegisterComponent {
    private readonly fb = inject(FormBuilder);
    private readonly createEmployee = inject(CreateEmployeeUseCase);

    @Output() registered = new EventEmitter<Employee>();

    isSubmitting = false;
    successMessage = '';
    backendError = '';

    // Deben suministrarse desde el contexto autenticado/autorizado.
    // No confiar en valores editables por el usuario.
    userId = '';
    barberiaId = '';

    readonly specialties = [
        'Cortes',
        'Barba',
        'Colorimetría',
        'Tratamientos capilares'
    ];

    selectedSpecialties = new Set<string>();

    readonly form = this.fb.nonNullable.group({
        name: ['', [Validators.required, Validators.maxLength(120)]],
        documentType: ['', Validators.required],
        document: ['', [Validators.required, Validators.maxLength(30)]],
        email: ['', [Validators.required, Validators.email]],
        cell: ['', [
            Validators.required,
            Validators.pattern(/^[0-9]{10}$/)
        ]],
        experienceYears: [0, [
            Validators.required,
            Validators.min(0),
            Validators.max(70)
        ]]
    });

    toggleSpecialty(specialty: string, checked: boolean): void {
        if (checked) {
            this.selectedSpecialties.add(specialty);
        } else {
            this.selectedSpecialties.delete(specialty);
        }
    }

    submit(): void {
        this.successMessage = '';
        this.backendError = '';

        if (this.form.invalid || this.selectedSpecialties.size === 0) {
            this.form.markAllAsTouched();
            return;
        }

        if (!this.userId || !this.barberiaId) {
            this.backendError =
                'No fue posible identificar el usuario o la barbería.';
            return;
        }

        const value = this.form.getRawValue();

        const request: EmployeeRegistration = {
            userId: this.userId,
            barberiaId: this.barberiaId,
            name: value.name.trim(),
            documentType: value.documentType,
            document: value.document.trim(),
            email: value.email.trim().toLowerCase(),
            cell: value.cell,
            specialty: [...this.selectedSpecialties].join(', '),
            experienceYears: value.experienceYears
        };

        this.isSubmitting = true;

        this.createEmployee.execute(request)
            .pipe(finalize(() => this.isSubmitting = false))
            .subscribe({
                next: (employee) => {
                    this.successMessage = 'Barbero registrado correctamente.';
                    this.registered.emit(employee);
                    this.form.reset({
                        name: '',
                        documentType: '',
                        document: '',
                        email: '',
                        cell: '',
                        experienceYears: 0
                    });
                    this.selectedSpecialties.clear();
                },
                error: (error) => {
                    this.backendError =
                        error?.error?.message ??
                        error?.error?.mensaje ??
                        'No fue posible registrar el barbero. Intenta nuevamente.';
                }
            });
    }
}