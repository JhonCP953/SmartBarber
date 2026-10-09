import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormsModule } from '@angular/forms';
import { BarberShopApiService as BarberConfigApiService } from '../../infrastructure/services/barber-shop-api.service';

@Component({
  selector: 'app-barber-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class BarberConfigComponent implements OnInit {
  barberId = '1';
  isEditing = false;
  barberList: any[] = [];
  searchTerm = '';
  selectedBarberName = '';
  infoForm!: FormGroup;
  holidays: any[] = [];
  newHolidayDate = '';
  newHolidayDesc = '';

  daysOfWeek = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly configApiService: BarberConfigApiService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadBarberList();
  }

  private initForm(): void {
    this.infoForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      description: [''],
      hours: this.fb.array(this.daysOfWeek.map(day => this.fb.group({
        dayOfWeek: [day],
        isOpen: [true],
        openTime: ['08:00'],
        closeTime: ['20:00']
      })))
    });
  }

  get hoursArray(): FormArray {
    return this.infoForm.get('hours') as FormArray;
  }

  loadBarberList(): void {
    this.configApiService.obtenerBarberias(this.barberId).subscribe({
      next: (res: any[]) => {
        if (res && res.length > 0) {
          this.barberList = res;
          this.barberId = String(this.barberList[0].id ?? '1');
          this.selectedBarberName = this.barberList[0].name || '';
          this.loadHolidays();
        } else {
          this.loadMockData();
        }
      },
      error: (err: any) => {
        console.warn('Backend no disponible, cargando datos de prueba locales...', err);
        this.loadMockData();
      }
    });
  }

  // Datos de prueba locales en caso de que el backend esté vacío o sin conexión
  private loadMockData(): void {
    this.barberList = [
      {
        id: 1,
        name: 'Barbería Clásica El Capo',
        phone: '3001234567',
        address: 'Calle 100 #15-20, Bogotá',
        description: 'Especialistas en barbas estilo vintage.'
      },
      {
        id: 2,
        name: 'The Gentleman Barber Shop',
        phone: '3109876543',
        address: 'Carrera 7 #45-12, Chía',
        description: 'Tradición y modernidad.'
      }
    ];
    this.barberId = String(this.barberList[0].id ?? '1');
    this.selectedBarberName = this.barberList[0].name;
    this.loadHolidays();
  }

  // Método que se activa al cambiar de sucursal en el selector de horarios y festivos
  onBarberSelectionChange(): void {
    const found = this.barberList.find(b => Number(b.id) === Number(this.barberId));
    if (found) {
      this.selectedBarberName = found.name;
    }
    this.loadHolidays();
  }

  selectForEdit(item: any): void {
    this.isEditing = true;
    this.barberId = String(item.id ?? this.barberId);
    this.selectedBarberName = item.name || '';
    this.infoForm.patchValue({
      name: item.name,
      phone: item.phone,
      address: item.address,
      description: item.description || ''
    });
    this.loadHolidays();
  }

  selectForView(item: any): void {
    this.isEditing = false;
    this.barberId = String(item.id ?? this.barberId);
    this.selectedBarberName = item.name || '';
    alert(`Visualizando detalles de: ${item.name}`);
    this.loadHolidays();
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  loadHolidays(): void {
    const barberId = Number(this.barberId);

    this.configApiService.obtenerDiasNoLaborables(barberId).subscribe({
      next: (res: any[]) => { this.holidays = res || []; },
      error: (err: any) => console.error('Error al cargar festivos', err)
    });
  }

  saveGeneralConfig(): void {
    if (this.infoForm.invalid) return;

    const formValue = this.infoForm.value;
    const barberId = Number(this.barberId);

    const infoPayload = {
      name: formValue.name,
      phone: formValue.phone,
      address: formValue.address,
      description: formValue.description
    };

    this.configApiService.actualizarConfiguracionBarberia(barberId, infoPayload).subscribe({
      next: () => {
        alert('¡Información actualizada con éxito!');
        this.isEditing = false;
        this.loadBarberList();
      },
      error: () => alert('Error al actualizar la información.')
    });

    this.configApiService.actualizarHorarios(barberId, formValue.hours).subscribe({
      next: () => console.log('Horarios actualizados'),
      error: () => console.error('Error al actualizar horarios')
    });
  }

  addHoliday(): void {
    if (!this.newHolidayDate) return;

    const payload = {
      date: this.newHolidayDate,
      description: this.newHolidayDesc || 'Día no laborable'
    };

    this.configApiService.agregarDiaNoLaborable(Number(this.barberId), payload).subscribe({
      next: () => {
        this.newHolidayDate = '';
        this.newHolidayDesc = '';
        this.loadHolidays();
        alert('Día no laborable agregado.');
      },
      error: () => alert('Error al agregar el registro.')
    });
  }

  removeHoliday(id: number): void {
    this.configApiService.eliminarDiaNoLaborable(id).subscribe({
      next: () => this.loadHolidays(),
      error: () => alert('Error al eliminar.')
    });
  }
}