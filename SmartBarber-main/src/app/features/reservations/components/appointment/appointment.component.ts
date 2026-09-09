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

  services = ['Corte clásico', 'Arreglo de barba', 'Color y mechas', 'Tratamiento capilar', 'Peinado & evento', 'Combo completo'];
  barbers = ['Camilo Rey', 'Julián Prieto', 'Andrés Villa', 'Mariano Correa'];

  state: SubmitState = 'idle';

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', Validators.email],
    phone: ['', Validators.required],
    preferredTime: [''],
    service: ['', Validators.required],
    barber: ['']
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.state = 'sending';

    this.http.post(formEndpoints.appointmentEndpoint, this.form.value, {
      headers: { Accept: 'application/json' }
    }).subscribe({
      next: () => {
        this.state = 'success';
        setTimeout(() => {
          this.state = 'idle';
          this.form.reset();
        }, 3000);
      },
      error: (err) => {
        console.error('Error al enviar la reserva:', err);
        this.state = 'error';
        setTimeout(() => (this.state = 'idle'), 4000);
      }
    });
  }
}