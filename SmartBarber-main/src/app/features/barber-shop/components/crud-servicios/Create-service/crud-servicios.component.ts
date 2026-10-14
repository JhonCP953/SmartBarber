import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface BarberServicePayload {
  barberiaId: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  offert: boolean;
  special_price: number;
}

@Component({
  selector: 'app-barber-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crud-servicios.component.html',
  styleUrls: ['./crud-servicios.component.css']
})
export class BarberServiConfigComponent implements OnInit {
  serviceForm!: FormGroup;

  // Lista simulada de servicios creados
  servicesList: BarberServicePayload[] = [
    {
      barberiaId: 'a9038d25-c8c3-4cfa-8025-b198b1861060',
      name: 'Corte clasico',
      description: 'Corte moderno con degradado',
      duration: 15,
      price: 1000,
      offert: true,
      special_price: 800
    }
  ];

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.serviceForm = this.fb.group({
      barberiaId: ['a9038d25-c8c3-4cfa-8025-b198b1861060', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      duration: [15, [Validators.required, Validators.min(5)]],
      price: [1000, [Validators.required, Validators.min(0)]],
      offert: [false],
      special_price: [0, [Validators.min(0)]]
    });

    // Validar precio especial cuando la oferta cambie
    this.serviceForm.get('offert')?.valueChanges.subscribe((isOffert: boolean) => {
      const specialPriceControl = this.serviceForm.get('special_price');
      if (isOffert) {
        specialPriceControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        specialPriceControl?.clearValidators();
        specialPriceControl?.setValue(0);
      }
      specialPriceControl?.updateValueAndValidity();
    });
  }

  saveService(): void {
    if (this.serviceForm.invalid) {
      alert('⚠️ Por favor completa todos los campos del servicio correctamente.');
      return;
    }

    const payload: BarberServicePayload = this.serviceForm.value;
    console.log('🚀 [CREAR SERVICIO - PAYLOAD JSON]:', JSON.stringify(payload, null, 2));

    this.servicesList.push(payload);
    alert('¡Servicio registrado exitosamente! 💈');
    this.resetForm();
  }

  resetForm(): void {
    this.serviceForm.patchValue({
      name: '',
      description: '',
      duration: 15,
      price: 1000,
      offert: false,
      special_price: 0
    });
  }

  deleteService(index: number): void {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      this.servicesList.splice(index, 1);
    }
  }
}