import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms'; 
import { BarberServiceService } from '../../../service/barber-service.service';
import { BarberShopApiService } from '../../../infrastructure/services/barber-shop-api.service';

export interface BarberServicePayload {
  id?: number;
  barberiaId: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  offert: boolean;
  special_price: number;
  status?: boolean;
  isActive?: boolean;
}

@Component({
  selector: 'app-barber-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule], // <-- 2. Incluido FormsModule aquí
  templateUrl: './crud-servicios.component.html',
  styleUrls: ['./crud-servicios.component.css']
})
export class BarberServiConfigComponent implements OnInit {
  serviceForm!: FormGroup;
  
  isEditMode = false;
  editingIndex: number | null = null;
  editingServiceId: number | null = null;

  servicesList: BarberServicePayload[] = [];
  readonly currentBarberiaId = '3563acd0-d8e2-4018-aabf-b47d3d9cde11';

  // Propiedades para la búsqueda de barbería por ID
  barberiaId: string = '';
  barberiaEncontrada: any = null;
  cargando: boolean = false;
  errorMensaje: string = '';
  barberiasList: any[] = [];

  private readonly fb = inject(FormBuilder);
  private readonly barberShopApiService = inject(BarberShopApiService);
  private readonly barberService = inject(BarberServiceService);

  ngOnInit(): void {
    this.initForm();
    this.loadBarberias();
    this.loadAllServices();
  }

  private initForm(): void {
    this.serviceForm = this.fb.group({
      barberiaId: [this.currentBarberiaId, [Validators.required]],
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
    this.barberService.getServicesByBarberiaId(this.currentBarberiaId).subscribe({
      next: (data: any) => {
        const servicesArray = Array.isArray(data) ? data : [data];

        this.servicesList = servicesArray.map((item: any) => ({
          ...item,
          isActive: item.status ?? item.isActive ?? true
        }));
      },
      error: (err: any) => {
        console.error('❌ Error al obtener los servicios del servidor:', err);
      }
    });
  }

  saveService(): void {
    if (this.serviceForm.invalid) {
      alert('⚠️ Por favor completa todos los campos del servicio correctamente.');
      return;
    }

    const formValues = this.serviceForm.value;

    const payload = {
      barberiaId: formValues.barberiaId,
      name: formValues.name,
      description: formValues.description,
      duration: formValues.duration,
      price: formValues.price,
      offert: formValues.offert,
      special_price: formValues.special_price
    };

    if (this.isEditMode && this.editingServiceId !== null) {
      this.barberService.updateService(this.editingServiceId, payload).subscribe({
        next: (response: any) => {
          alert('¡Servicio modificado en la base de datos exitosamente! ✏️');
          this.cancelEdit();
          this.loadAllServices();
        },
        error: (err: any) => {
          console.error('❌ [UPDATE ERROR FULL]:', err);
          alert('Hubo un error al actualizar el servicio en la base de datos.');
        }
      });
    } else {
      this.barberService.createService(payload).subscribe({
        next: (response: any) => {
          alert('¡Servicio registrado exitosamente! 💈');
          this.resetForm();
          this.loadAllServices();
        },
        error: (err: any) => {
          console.error('❌ [CREATE ERROR]:', err);
          alert('Hubo un error al conectar con el servidor.');
        }
      });
    }
  }

  editService(index: number): void {
    const service = this.servicesList[index];
    if (!service.id) {
      alert('⚠️ Este servicio no tiene un ID válido para editar.');
      return;
    }

    this.isEditMode = true;
    this.editingIndex = index;
    this.editingServiceId = service.id;

    this.serviceForm.patchValue({
      barberiaId: service.barberiaId || this.currentBarberiaId,
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      offert: service.offert,
      special_price: service.special_price,
      isActive: service.isActive ?? true
    });
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
      barberiaId: this.currentBarberiaId,
      name: '',
      description: '',
      duration: 15,
      price: 1000,
      offert: false,
      special_price: 0,
      isActive: true
    });
  }


// Método para obtener todas las barberías de la BD
loadBarberias(): void {
  this.barberShopApiService.getAll().subscribe({
    next: (data: any) => {
      this.barberiasList = Array.isArray(data) ? data : [data];
      console.log('🏢 Barberías cargadas:', this.barberiasList);
    },
    error: (err: any) => {
      console.error('❌ Error al cargar las barberías:', err);
    }
  });
}

// Método que se ejecuta cuando cambias de barbería en el menú desplegable
onBarberiaSelected(event: any): void {
  const selectedId = event.target.value;
  // Actualizamos tanto la variable local como el formulario reactivo
  (this as any).currentBarberiaId = selectedId;
  this.serviceForm.patchValue({ barberiaId: selectedId });
  
  // Recargamos los servicios correspondientes a esta barbería
  this.loadAllServices();
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