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
  
  // Variables para la gestión de horarios de empleados
  selectedEmpleadoUuid = '3d7792b5-3e1f-44c8-bf84-b766068b';
  selectedHorarioId: number | string = 3; 

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
      
      // Controles para la jornada laboral alineados a horario_empleado
      horaInicio: ['08:00', Validators.required],
      horaFin: ['18:00', Validators.required],
      horaInicioAlmuerzo: ['12:00'],
      horaFinAlmuerzo: ['13:00'],
      vacaciones: [false],

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
    console.log('📡 [FRONTEND] Solicitando listado de EMPLEADOS...');

    this.configApiService.getEmpleados().subscribe({
      next: (res: any) => {
        console.log('📦 [BACKEND - RESPUESTA CRUD EMPLEADOS]:', res);

        if (!res) {
          this.barberList = [];
          return;
        }

        if (Array.isArray(res)) {
          this.barberList = res;
        } else if (res.data && Array.isArray(res.data)) {
          this.barberList = res.data;
        } else if (res.content && Array.isArray(res.content)) {
          this.barberList = res.content;
        } else {
          this.barberList = [res];
        }

        if (this.barberList.length > 0) {
          const firstItem = this.barberList[0];
          this.selectedEmpleadoUuid = String(
            firstItem.idEmpleado ??
            firstItem.id_empleado ??
            firstItem.uuid ??
            firstItem.id ?? ''
          );
        }
      },
      error: (err: any) => {
        console.error('❌ [BACKEND - ERROR AL CARGAR EMPLEADOS]:', err);
      }
    });
  }

  onBarberSelectionChange(): void {
    const found = this.barberList.find(b => String(b.id_barberia ?? b.id) === String(this.barberId));
    if (found) {
      this.selectedBarberName = found.nombre ?? found.name ?? '';
      this.selectedEmpleadoUuid = String(found.id_empleado ?? found.uuid ?? found.id ?? '');
      this.patchFormValues(found);
    }
  }

  onScheduleBarberSelectionChange(): void {
    console.log('📡 [FRONTEND] Consultando horario para el ID:', this.selectedHorarioId);

    if (!this.selectedHorarioId) return;

    this.configApiService.obtenerHorarioEmpleadoPorId(this.selectedHorarioId).subscribe({
      next: (res: any) => {
        console.log('📦 [BACKEND - HORARIO OBTENIDO POR ID]:', res);
        if (res) {
          this.infoForm.patchValue({
            horaInicio: res.hora_inicio ? res.hora_inicio.substring(0, 5) : '08:00',
            horaFin: res.hora_fin ? res.hora_fin.substring(0, 5) : '18:00',
            horaInicioAlmuerzo: res.hora_inicio_almuerzo ? res.hora_inicio_almuerzo.substring(0, 5) : '12:00',
            horaFinAlmuerzo: res.hora_fin_almuerzo ? res.hora_fin_almuerzo.substring(0, 5) : '13:00',
            vacaciones: res.vacaciones ?? false
          });
        }
      },
      error: (err: any) => {
        console.warn('⚠️ [BACKEND] No se encontró horario para este ID:', err);
      }
    });
  }

  addHoliday(): void {
    if (!this.newHolidayDate) {
      alert('Por favor selecciona una fecha válida.');
      return;
    }

    const holidayItem = {
      id: Date.now(),
      fecha: this.newHolidayDate,
      descripcion: this.newHolidayDesc
    };

    this.holidays.push(holidayItem);
    this.newHolidayDate = '';
    this.newHolidayDesc = '';
  }

  removeHoliday(id: number | string): void {
    this.holidays = this.holidays.filter(h => h.id !== id);
  }

  selectForEdit(item: any): void {
    this.isEditing = true;
    this.barberId = String(item.id_barberia ?? item.id ?? '');
    this.selectedBarberName = item.nombre ?? item.name ?? '';
    this.selectedEmpleadoUuid = String(item.id_empleado ?? item.uuid ?? item.id ?? '');
    this.patchFormValues(item);
  }

  selectForView(item: any): void {
    this.isEditing = false;
    this.barberId = String(item.id_barberia ?? item.id ?? '');
    this.selectedBarberName = item.nombre ?? item.name ?? '';
    this.selectedEmpleadoUuid = String(item.id_empleado ?? item.uuid ?? item.id ?? '');
    this.patchFormValues(item);
  }

  cancelEdit(): void {
    this.isEditing = false;
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

  saveGeneralConfig(): void {
    if (this.infoForm.invalid) return;

    const formValue = this.infoForm.value;

    this.configApiService.update(this.barberId, {
        name: formValue.nombre,
        companyName: formValue.razon_social,
        documentType: formValue.tipo_documento,
        document: formValue.documento,
        phone: formValue.celular,
        location: formValue.ubicacion,
        description: formValue.descripcion
      }).subscribe({
      next: () => {
        console.log('✅ [BACKEND] Información general actualizada con éxito.');
        alert('¡Información actualizada con éxito!');
        this.isEditing = false;
        this.loadBarberList();
      },
      error: (err: any) => {
        console.error('❌ [ERROR GENERAL]:', err);
        alert('Error al actualizar la información.');
      }
    });
  }

  saveHorarios(): void {
    const formValue = this.infoForm.value;

    if (!this.selectedEmpleadoUuid) {
      alert('⚠️ Por favor define un UUID de empleado válido.');
      return;
    }

    // Aseguramos formato estricto HH:mm:ss que Java entiende perfectamente
    const formatTime = (timeStr: string) => {
      if (!timeStr) return '08:00:00';
      return timeStr.length === 5 ? `${timeStr}:00` : timeStr;
    };

    const schedulePayload = {
      empleadoId: this.selectedEmpleadoUuid.trim(),
      horaInicio: formatTime(formValue.horaInicio),
      horaFin: formatTime(formValue.horaFin),
      horaInicioAlmuerzo: formatTime(formValue.horaInicioAlmuerzo),
      horaFinAlmuerzo: formatTime(formValue.horaFinAlmuerzo),
      vacation: Boolean(formValue.vacaciones)
    };

    console.log('🚀 [ENVIANDO PAYLOAD LIMPIO]:', JSON.stringify(schedulePayload, null, 2));

    this.configApiService.crearHorarioEmpleado(schedulePayload).subscribe({
      next: (res: any) => {
        console.log('📦 [ÉXITO TOTAL]:', res);
        alert('¡Horario de empleado guardado con éxito en la base de datos! 🎉');
      },
      error: (err: any) => {
        console.error('❌ [ERROR DEL SERVIDOR]:', err);
        alert(`Error: ${JSON.stringify(err.error?.message || err.error)}`);
      }
    });
  }
}