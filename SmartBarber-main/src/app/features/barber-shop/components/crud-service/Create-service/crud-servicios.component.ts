import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BarberServiceService } from '../../../service/barber-service.service';

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
  
  isEditMode = false;
  editingIndex: number | null = null;

  servicesList: BarberServicePayload[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly barberService: BarberServiceService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAllServices();
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

  loadAllServices(): void {
    this.barberService.getAllServices().subscribe({
      next: (data: any) => {
        const servicesArray = Array.isArray(data) ? data : [data];
        this.servicesList = servicesArray.map((item: any) => ({
          ...item,
          isActive: true
        }));
        console.log('✅ Todos los servicios cargados desde la BD:', this.servicesList);
      },
      error: (err: any) => {
        console.error('❌ Error al cargar los servicios:', err);
      }
    });
  }

  saveService(): void {
    if (this.serviceForm.invalid) {
      alert('⚠️ Por favor completa todos los campos del servicio correctamente.');
      return;
    }

    const payload: BarberServicePayload = this.serviceForm.value;

    if (this.isEditMode && this.editingIndex !== null) {
      payload.isActive = this.servicesList[this.editingIndex].isActive ?? true;
      this.servicesList[this.editingIndex] = payload;
      alert('¡Servicio modificado exitosamente! ✏️');
      this.cancelEdit();
    } else {
      this.barberService.createService(payload).subscribe({
        next: (response: any) => {
          console.log('🚀 [BACKEND RESPONSE]:', response);
          this.loadAllServices();
          alert('¡Servicio registrado y guardado en la base de datos exitosamente! 💈');
          this.resetForm();
        },
        error: (err: any) => {
          console.error('❌ Error al guardar el servicio:', err);
          alert('Hubo un error al conectar con el servidor.');
        }
      });
    }
  }

  editService(index: number): void {
    this.isEditMode = true;
    this.editingIndex = index;
    const service = this.servicesList[index];
    this.serviceForm.patchValue(service);
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.editingIndex = null;
    this.resetForm();
  }

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