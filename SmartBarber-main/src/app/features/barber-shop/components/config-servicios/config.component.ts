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
  barberId = '';
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
    console.log('🔥 [FRONTEND] Inicializando BarberConfigComponent...');
    this.initForm();
    this.loadBarberList();
  }

  /**
   * Inicialización del formulario reactivo principal
   */
  private initForm(): void {
    this.infoForm = this.fb.group({
      nombre: ['', Validators.required],
      razon_social: [''],
      tipo_documento: ['', Validators.required],
      documento: ['', Validators.required],
      celular: ['', Validators.required],
      ubicacion: ['', Validators.required],
      descripcion: [''],
      estado: ['ACTIVO'],
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

  /**
   * Carga el listado completo utilizando estrictamente el getAll() del servicio
   */
  loadBarberList(): void {
    console.log('📡 [FRONTEND] Solicitando listado de barberías al backend...');
    
    this.configApiService.getAll().subscribe({
      next: (res: any) => {
        console.log('📦 [BACKEND - RESPUESTA EXITOSA (getAll)]:', res);
        this.barberList = Array.isArray(res) ? res : (res ? [res] : []);

        if (this.barberList.length > 0) {
          const firstItem = this.barberList[0];
          this.barberId = String(firstItem.id_barberia ?? firstItem.id ?? firstItem.idBarberia ?? '');
          this.selectedBarberName = firstItem.nombre ?? firstItem.name ?? '';
          
          this.patchFormValues(firstItem);
          this.loadHolidays();
          console.log('✅ [FRONTEND] Primer registro mapeado correctamente.');
        } else {
          console.warn('⚠️ [BACKEND] La conexión fue exitosa pero la lista llegó vacía.');
        }
      },
      error: (err: any) => {
        console.error('❌ [BACKEND - ERROR DE CONEXIÓN]: Error al listar barberías:', err);
      }
    });
  }

  onBarberSelectionChange(): void {
    const found = this.barberList.find(b => String(b.id_barberia ?? b.id ?? b.idBarberia) === String(this.barberId));
    if (found) {
      this.selectedBarberName = found.nombre ?? found.name ?? '';
      this.patchFormValues(found);
    }
    this.loadHolidays();
  }

  selectForEdit(item: any): void {
    this.isEditing = true;
    this.barberId = String(item.id_barberia ?? item.id ?? item.idBarberia ?? this.barberId);
    this.selectedBarberName = item.nombre ?? item.name ?? '';
    
    this.patchFormValues(item);
    this.loadHolidays();
  }

  selectForView(item: any): void {
    this.isEditing = false;
    this.barberId = String(item.id_barberia ?? item.id ?? item.idBarberia ?? this.barberId);
    this.selectedBarberName = item.nombre ?? item.name ?? '';
    
    this.patchFormValues(item);
    this.loadHolidays();
  }

  private patchFormValues(item: any): void {
    this.infoForm.patchValue({
      nombre: item.nombre ?? item.name ?? '',
      razon_social: item.razon_social ?? item.razonSocial ?? '',
      tipo_documento: item.tipo_documento ?? item.tipoDocumento ?? '',
      documento: item.documento ?? '',
      celular: item.celular ?? item.phone ?? '',
      ubicacion: item.ubicacion ?? item.location ?? '',
      descripcion: item.descripcion ?? item.description ?? '',
      estado: item.estado ?? 'ACTIVO'
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  /**
   * Envía los datos generales y los horarios con validación y logs detallados en consola
   */
  saveGeneralConfig(): void {
    if (this.infoForm.invalid) return;

    const formValue = this.infoForm.value;

    const infoPayload = {
      name: formValue.nombre,
      companyName: formValue.razon_social,
      documentType: formValue.tipo_documento,
      document: formValue.documento,
      phone: formValue.celular,
      location: formValue.ubicacion,
      description: formValue.descripcion
    };

    // 1. Petición para actualizar información general
    console.log('📡 [FRONTEND] Actualizando información general de la barbería...');
    this.configApiService.update(this.barberId, infoPayload).subscribe({
      next: () => {
        console.log('✅ [BACKEND] Información general actualizada con éxito.');
        alert('¡Información actualizada con éxito!');
        this.isEditing = false;
        this.loadBarberList();
      },
      error: (err: any) => {
        console.error('❌ [BACKEND - ERROR GENERAL]:', err);
        alert('Error al actualizar la información.');
      }
    });

    // 2. Petición para actualizar y crear horarios (con logs de validación)
    if (formValue.hours) {
      console.log('📡 [FRONTEND] Enviando horarios al endpoint de schedule:', formValue.hours);

      this.configApiService.actualizarHorarios(this.barberId as any, formValue.hours).subscribe({
        next: (res: any) => {
          console.log('📦 [BACKEND - HORARIOS EXITOSO]:', res);
          console.log('✅ [FRONTEND] ¡Conexión con el endpoint de horarios completada!');
        },
        error: (err: any) => {
          console.error('❌ [BACKEND - ERROR EN HORARIOS / SQL]:', err);
          console.warn('💡 Nota para backend: Verificar restricciones de llave foránea o IDs de empleados.');
        }
      });
    }
  }

  /**
   * Carga de días no laborables (Festivos)
   */
  loadHolidays(): void {
    if (!this.barberId) return;

    this.configApiService.obtenerDiasNoLaborables(this.barberId as any).subscribe({
      next: (res: any[]) => { this.holidays = res || []; },
      error: (err: any) => console.error('Error al cargar festivos:', err)
    });
  }

  addHoliday(): void {
    if (!this.newHolidayDate) return;

    const payload = {
      date: this.newHolidayDate,
      description: this.newHolidayDesc || 'Día no laborable'
    };

    this.configApiService.agregarDiaNoLaborable(this.barberId as any, payload).subscribe({
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