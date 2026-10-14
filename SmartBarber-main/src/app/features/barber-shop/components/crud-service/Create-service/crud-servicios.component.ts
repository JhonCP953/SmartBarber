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
  isActive?: boolean;
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
  
  // Variables de control para Modificar
  isEditMode = false;
  editingIndex: number | null = null;

  // Lista simulada de servicios creados con estado activo por defecto
  servicesList: BarberServicePayload[] = [
    {
      barberiaId: 'a9038d25-c8c3-4cfa-8025-b198b1861060',
      name: 'Corte clasico',
      description: 'Corte moderno con degradado',
      duration: 15,
      price: 1000,
      offert: true,
      special_price: 800,
      isActive: true
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
      special_price: [0, [Validators.min(0)]],
      isActive: [true]
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

    if (this.isEditMode && this.editingIndex !== null) {
      // Modificar servicio existente manteniendo su estado actual
      payload.isActive = this.servicesList[this.editingIndex].isActive ?? true;
      this.servicesList[this.editingIndex] = payload;
      alert('¡Servicio modificado exitosamente! ✏️');
      this.cancelEdit();
    } else {
      // Crear nuevo servicio
      payload.isActive = true;
      console.log('🚀 [CREAR SERVICIO - PAYLOAD JSON]:', JSON.stringify(payload, null, 2));
      this.servicesList.push(payload);
      alert('¡Servicio registrado exitosamente! 💈');
      this.resetForm();
    }
  }

  // Cargar datos en el formulario para modificar
  editService(index: number): void {
    this.isEditMode = true;
    this.editingIndex = index;
    const service = this.servicesList[index];
    this.serviceForm.patchValue(service);
  }

  // Cancelar la edición y limpiar formulario
  cancelEdit(): void {
    this.isEditMode = false;
    this.editingIndex = null;
    this.resetForm();
  }

  // Alternar entre Activo / Desactivar
  toggleServiceStatus(index: number): void {
    const currentStatus = this.servicesList[index].isActive ?? true;
    this.servicesList[index].isActive = !currentStatus;
  }

  resetForm(): void {
    this.serviceForm.patchValue({
      name: '',
      description: '',
      duration: 15,
      price: 1000,
      offert: false,
      special_price: 0,
      isActive: true
    });
  }

  deleteService(index: number): void {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      this.servicesList.splice(index, 1);
      if (this.editingIndex === index) {
        this.cancelEdit();
      }
    }
  }
}