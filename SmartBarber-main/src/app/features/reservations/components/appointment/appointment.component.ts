import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { formEndpoints } from '../../../../shared/forms/form-config';

type SubmitState = 'idle' | 'sending' | 'success' | 'error';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css'
})
export class AppointmentComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  // Arreglo de barberos alineado exactamente con la plantilla HTML
barberos = [
  'Crop Top con Fade',
  'Mullet Moderno',
  'Taper Fade',
  'Buzz Cut con Diseño'
];

  state: SubmitState = 'idle';

  // Formulario reactivo 'feedbackForm' que resuelve el error TS/NG9
  feedbackForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    barber: ['', Validators.required],
    rating: ['', Validators.required],
    comment: ['', [Validators.required, Validators.minLength(10)]]
  });

  onSubmit(): void {
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      return;
    }

    this.state = 'sending';

    this.http.post(formEndpoints.appointmentEndpoint, this.feedbackForm.value, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
    }).subscribe({
      next: () => {
        this.state = 'success';
        setTimeout(() => {
          this.state = 'idle';
          this.feedbackForm.reset();
        }, 3000);
      },
      error: (err) => {
        console.error('Error al enviar la opinión:', err);
        this.state = 'error';
        setTimeout(() => (this.state = 'idle'), 4000);
      }
    });
  }
}