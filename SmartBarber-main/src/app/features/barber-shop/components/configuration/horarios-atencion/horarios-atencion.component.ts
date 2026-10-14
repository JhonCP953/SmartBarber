import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormsModule } from '@angular/forms';
import { BarberShopApiService as BarberConfigApiService } from '../../../infrastructure/services/barber-shop-api.service';

@Component({
  selector: 'app-horarios-atencion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './horarios-atencion.component.html',
  styleUrls: ['../shared/vintage-shared.css', './horarios-atencion.component.css']
})
export class HorariosAtencionComponent implements OnInit {
  @Input() barberList: any[] = [];

  // Two-way: [(selectedEmpleadoUuid)] desde el padre
  @Input() selectedEmpleadoUuid = '';
  @Output() selectedEmpleadoUuidChange = new EventEmitter<string>();

  selectedHorarioId: number | string = 3;

  horarioForm!: FormGroup;

  daysOfWeek = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly configApiService: BarberConfigApiService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.horarioForm = this.fb.group({
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
    return this.horarioForm.get('hours') as FormArray;
  }

  onScheduleBarberSelectionChange(): void {
    console.log('📡 [FRONTEND] Consultando horario para el ID:', this.selectedHorarioId);

    if (!this.selectedHorarioId) return;

    this.configApiService.obtenerHorarioEmpleadoPorId(this.selectedHorarioId).subscribe({
      next: (res: any) => {
        console.log('📦 [BACKEND - HORARIO OBTENIDO POR ID]:', res);
        if (res) {
          this.horarioForm.patchValue({
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

  saveHorarios(): void {
    const formValue = this.horarioForm.value;

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
