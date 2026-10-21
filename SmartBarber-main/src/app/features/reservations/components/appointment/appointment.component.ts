import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { getAuth } from 'firebase/auth';
import { ReservationService } from '../../services/reservation.service';
import { Barberia, Barbero, SlotHorario, RangoOcupado } from '../../models/reservation.model';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css']
})
export class AppointmentComponent implements OnInit {
  internalDatabaseUserId: string = getAuth().currentUser?.uid ?? '';
  barberias: Barberia[] = [];
  barberosFiltrados: Barbero[] = [];

  selectedBarberiaId: string = '';
  selectedBarbero: Barbero | null = null;

  currentDate: Date = new Date();
  monthNames: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  currentMonthYear: string = '';
  diasMes: number[] = [];
  paddingDays: number[] = [];

  selectedDia: number | null = null;
  selectedFecha: string = '';
  selectedHora: string = '';

  // Servicios dinámicos
  selectedServicesIds: number[] = [];
  serviciosDisponibles: any[] = [];
  loadingServicios: boolean = false;
  precioTotalCalculado: number = 0;

  // Horarios
  slotsHorarios: SlotHorario[] = [];
  loadingHorarios: boolean = false;
  errorHorario: string = '';

  // Reserva
  isLoading: boolean = false;

  // TEMPORAL: solo para pruebas mientras el backend no envía el scheduleId
  // en la lista de empleados. Ponlo en null cuando ya lo envíen.
  private readonly scheduleIdPrueba: number | null = 5;

  constructor(
    private reservationService: ReservationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.generarCalendario();
    this.cargarBarberias();
  }

  // ───────────────────────── Carga de datos ─────────────────────────

  cargarBarberias(): void {
    this.reservationService.getBarberias().subscribe({
      next: (res: any) => {
        const rawList = res.data || res;
        this.barberias = Array.isArray(rawList) ? rawList : [rawList];

        const barberiaIdParam = this.route.snapshot.queryParamMap.get('barberiaId');

        if (barberiaIdParam && this.barberias.some((b: any) => (b.id || b.id_barberia) === barberiaIdParam)) {
          this.selectedBarberiaId = barberiaIdParam;
        } else if (this.barberias.length > 0) {
          const first = this.barberias[0] as any;
          this.selectedBarberiaId = first.id || first.id_barberia;
        }

        if (this.selectedBarberiaId) {
          this.cargarEmpleadosPorBarberia(this.selectedBarberiaId);
          this.cargarServiciosPorBarberia(this.selectedBarberiaId);
        }
      },
      error: (err: any) => {
        console.error('Error al cargar las barberías:', err);
      }
    });
  }

  cargarEmpleadosPorBarberia(barberiaId: string): void {
    if (!barberiaId) return;

    this.reservationService.getEmployeesByBarberiaId(barberiaId).subscribe({
      next: (res: any) => {
        const rawList = res.data || res;
        const list = Array.isArray(rawList) ? rawList : (rawList ? [rawList] : []);

        this.barberosFiltrados = list.map((emp: any) => ({
          id: emp.id || emp.id_empleado,
          name: emp.name || emp.nombre,
          especialidad: emp.specialty || emp.especialidad || 'Barbero Profesional',
          scheduleId: emp.scheduleId ?? emp.id_horario ?? emp.horarioId ?? this.scheduleIdPrueba,
          estado: 'libre',
          estadoTexto: 'Libre',
          foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
        }));

        if (this.barberosFiltrados.length > 0) {
          this.selectedBarbero = this.barberosFiltrados[0];
          if (this.selectedFecha) {
            this.generarHorariosDisponibles();
          }
        } else {
          this.selectedBarbero = null;
          this.slotsHorarios = [];
        }
      },
      error: (err: any) => {
        console.error('Error al cargar empleados para la barbería:', err);
        this.barberosFiltrados = [];
        this.selectedBarbero = null;
        this.slotsHorarios = [];
      }
    });
  }

  cargarServiciosPorBarberia(barberiaId: string): void {
    if (!barberiaId) return;

    this.loadingServicios = true;
    this.reservationService.getServicesByBarberiaId(barberiaId).subscribe({
      next: (res: any) => {
        const rawList = res.data || res;
        this.serviciosDisponibles = Array.isArray(rawList) ? rawList : (rawList ? [rawList] : []);
        this.selectedServicesIds = this.serviciosDisponibles
          .map((servicio: any) => servicio.id ?? servicio.id_servicio)
          .filter((id: any) => id !== undefined && id !== null);
        this.calcularTotal();
        this.loadingServicios = false;
      },
      error: (err: any) => {
        console.error('Error al cargar servicios para la barbería:', err);
        this.serviciosDisponibles = [];
        this.selectedServicesIds = [];
        this.precioTotalCalculado = 0;
        this.loadingServicios = false;
      }
    });
  }

  // ───────────────────────── Eventos de UI ─────────────────────────

  onBarberiaChange(barberiaId: string): void {
    this.selectedBarberiaId = barberiaId;
    this.selectedHora = '';
    if (barberiaId) {
      this.cargarEmpleadosPorBarberia(barberiaId);
      this.cargarServiciosPorBarberia(barberiaId);
    }
  }

  onBarberoSelect(barbero: Barbero): void {
    this.selectedBarbero = barbero;
    this.selectedHora = '';
    if (this.selectedDia) {
      this.generarHorariosDisponibles();
    }
  }

  isServiceSelected(servicioId: number): boolean {
    return this.selectedServicesIds.includes(servicioId);
  }

  toggleServiceSelection(servicio: any): void {
    const index = this.selectedServicesIds.indexOf(servicio.id);
    if (index > -1) {
      if (this.selectedServicesIds.length > 1) {
        this.selectedServicesIds.splice(index, 1);
      } else {
        alert('Debes mantener al menos un servicio seleccionado.');
        return;
      }
    } else {
      this.selectedServicesIds.push(servicio.id);
    }
    this.calcularTotal();
  }

  calcularTotal(): void {
    this.precioTotalCalculado = this.serviciosDisponibles
      .filter(s => this.selectedServicesIds.includes(s.id))
      .reduce((acc, current) => acc + (current.special_price || current.price || 0), 0);
  }

  // ───────────────────────── Calendario ─────────────────────────

  generarCalendario(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    this.currentMonthYear = `${this.monthNames[month]} ${year}`;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    this.diasMes = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    let firstDayIndex = new Date(year, month, 1).getDay();
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    this.paddingDays = Array.from({ length: firstDayIndex }, (_, i) => i);

    const today = new Date();
    if (today.getFullYear() === year && today.getMonth() === month) {
      this.seleccionarDia(today.getDate());
    } else {
      this.selectedDia = null;
      this.selectedFecha = '';
      this.selectedHora = '';
      this.slotsHorarios = [];
    }
  }

  cambiarMes(delta: number): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + delta);
    this.currentDate = new Date(this.currentDate);
    this.generarCalendario();
  }

  seleccionarDia(dia: number): void {
    this.selectedDia = dia;
    this.selectedHora = '';
    const year = this.currentDate.getFullYear();
    const month = (this.currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = dia.toString().padStart(2, '0');

    this.selectedFecha = `${year}-${month}-${dayStr}`;

    if (this.selectedBarbero) {
      this.generarHorariosDisponibles();
    }
  }

  // ───────────────────────── Horarios y ocupación ─────────────────────────

  generarHorariosDisponibles(): void {
    const barbero = this.selectedBarbero;
    const fecha = this.selectedFecha;
    if (!barbero || !fecha) return;

    const scheduleId = barbero.scheduleId;
    if (scheduleId === null || scheduleId === undefined || scheduleId === '') {
      this.slotsHorarios = [];
      this.errorHorario = 'Este barbero no tiene un horario asignado.';
      this.setEstadoBarbero(barbero, 'descanso', 'Sin horario');
      return;
    }

    this.loadingHorarios = true;
    this.errorHorario = '';

    forkJoin({
      schedule: this.reservationService.getScheduleById(scheduleId).pipe(
        catchError(err => {
          console.error('Error al cargar el horario:', err);
          return of(null);
        })
      ),
      reservas: this.reservationService.getReservationsByEmployee(barbero.id, fecha).pipe(
        catchError(err => {
          console.warn('No se pudieron cargar las reservas del barbero:', err);
          return of([]);
        })
      )
    }).subscribe(({ schedule, reservas }) => {
      // Ignora respuestas viejas si el usuario ya cambió de barbero o de día
      if (this.selectedBarbero?.id !== barbero.id || this.selectedFecha !== fecha) return;

      this.loadingHorarios = false;

      const raw = (schedule as any)?.data ?? schedule;
      const turno = Array.isArray(raw) ? raw[0] : raw; // ajustar si el backend envía un turno por día
      const inicio = turno?.startTime ?? turno?.hora_inicio;
      const fin = turno?.endTime ?? turno?.hora_fin;

      if (!inicio || !fin) {
        this.slotsHorarios = [];
        this.errorHorario = 'El barbero no tiene turno disponible.';
        this.setEstadoBarbero(barbero, 'descanso', 'Sin turno');
        return;
      }

      const lista = (reservas as any)?.data ?? reservas ?? [];
      const ocupados: RangoOcupado[] = (Array.isArray(lista) ? lista : [])
        .filter((r: any) => r?.startTime && r?.endTime)
        .map((r: any) => ({
          ini: this.isoAMinutosLocal(r.startTime),
          fin: this.isoAMinutosLocal(r.endTime)
        }));

      this.slotsHorarios = this.construirSlotsDeTiempo(inicio, fin, ocupados);
      this.actualizarEstadoPorReservas(barbero, ocupados);
    });
  }

  // ISO (UTC o con offset) -> minutos del día en hora de Colombia
  private isoAMinutosLocal(iso: string): number {
    const hhmm = new Date(iso).toLocaleTimeString('en-GB', {
      timeZone: 'America/Bogota',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }

  private hoyColombia(): string {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  }

  private construirSlotsDeTiempo(horaInicio: string, horaFin: string, ocupados: RangoOcupado[]): SlotHorario[] {
    const toMin = (t: string): number => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const start = toMin(horaInicio);
    const end = toMin(horaFin);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [];

    const esHoy = this.selectedFecha === this.hoyColombia();
    const ahora = this.isoAMinutosLocal(new Date().toISOString());

    const slots: SlotHorario[] = [];
    for (let min = start; min + 30 <= end; min += 30) {
      const hora = `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
      const choca = ocupados.some(o => min < o.fin && min + 30 > o.ini);
      const pasado = esHoy && min <= ahora;

      slots.push({
        hora,
        disponible: !choca && !pasado,
        motivoOcupado: choca ? 'Ocupado' : pasado ? 'Pasado' : undefined
      });
    }
    return slots;
  }

  private setEstadoBarbero(b: Barbero, estado: string, texto: string): void {
    b.estado = estado;
    b.estadoTexto = texto;
  }

  private actualizarEstadoPorReservas(b: Barbero, ocupados: RangoOcupado[]): void {
    const esHoy = this.selectedFecha === this.hoyColombia();
    const ahora = this.isoAMinutosLocal(new Date().toISOString());
    const ocupadoAhora = esHoy && ocupados.some(o => ahora >= o.ini && ahora < o.fin);

    this.setEstadoBarbero(b, ocupadoAhora ? 'ocupado' : 'libre', ocupadoAhora ? 'Ocupado' : 'Libre');
  }

  seleccionarHora(slot: SlotHorario): void {
    if (slot.disponible) {
      this.selectedHora = slot.hora;
    }
  }

  // ───────────────────────── Crear reserva ─────────────────────────

  crearReserva(): void {
    if (!this.internalDatabaseUserId) {
      alert('⚠️ El perfil de usuario aún se está sincronizando. Por favor espera un segundo.');
      return;
    }

    if (!this.selectedBarbero || !this.selectedHora || !this.selectedFecha) {
      alert('Por favor selecciona un barbero, una fecha y un horario válido.');
      return;
    }

    if (!this.selectedServicesIds || this.selectedServicesIds.length === 0) {
      alert('⚠️ Debes seleccionar al menos un servicio para la reserva.');
      return;
    }

    this.isLoading = true;

    const startTimeIso = `${this.selectedFecha}T${this.selectedHora}:00-05:00`;

    const cleanServiceIds = this.selectedServicesIds
      .map((s: any) => {
        const idVal = typeof s === 'object' ? (s.id || s.id_servicio) : s;
        return Number(idVal);
      })
      .filter(id => !isNaN(id));

    const payload = {
      customerId: this.internalDatabaseUserId,
      employeeId: String(this.selectedBarbero.id || '').trim(),
      barbershopId: this.selectedBarberiaId,
      reservationServiceId: cleanServiceIds,
      startTime: startTimeIso,
      notes: 'Reserva creada desde Angular'
    };

    this.reservationService.createReservation(payload).subscribe({
      next: () => {
        this.isLoading = false;
        alert('¡Reserva creada exitosamente!');
        this.selectedHora = '';
        this.generarHorariosDisponibles(); // refresca y marca el slot como ocupado
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error al crear reserva backend:', err.status, err.error);
        const mensajeError =
          err.error?.message ||
          err.error?.data?.message ||
          err.error?.error ||
          (typeof err.error === 'string' ? err.error : '') ||
          'Error al procesar la reserva';
        alert(`Atención del Sistema: ${mensajeError}`);
      }
    });
  }
}