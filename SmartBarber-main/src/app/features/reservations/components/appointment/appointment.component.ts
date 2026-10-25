import { Component, OnDestroy, OnInit, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Unsubscribe, getAuth, onAuthStateChanged } from 'firebase/auth';
import { ReservationService } from '../../services/reservation.service';
import { Barberia, Barbero, SlotHorario, RangoOcupado } from '../../models/reservation.model';
import {CreateReservationPayload} from '../../models/reservation.model'
import {SessionService} from '../../../../core/auth/services/session.service'

interface Turno {
  inicio: string;                 // "08:00"
  fin: string;                    // "18:00"
  almuerzoInicio: string | null;  // "12:00"
  almuerzoFin: string | null;     // "13:00"
  vacaciones: boolean;
}

interface ScheduleResultado {
  schedule: any | null;
  fallo: boolean;
  sinHorario: boolean;
}

interface ResultadoHorario {
  turno: Turno | null;
  reservas: any;
  fallo: boolean;         // falló la carga del horario (red / servidor)
  sinHorario: boolean;    // el barbero no tiene horario configurado
  falloReservas: boolean; // falló la consulta de reservas (no por "sin reservas")
}

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css']
})
export class AppointmentComponent implements OnInit, OnDestroy {
  private readonly sessionService = inject(SessionService);
  // UID del usuario logueado en Firebase (se mantiene actualizado con onAuthStateChanged)
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
  avisoOcupacion: string = '';

  // Reserva
  isLoading: boolean = false;

  // Estado interno del día/barbero consultado (permite recalcular slots sin volver a llamar al backend)
  private turnoActual: Turno | null = null;
  private ocupadosActuales: RangoOcupado[] = [];
  private scheduleCache = new Map<string, any>();
  private authUnsub?: Unsubscribe;

  // SOLO PARA PRUEBAS: si se llena con un id_cliente real de la BD, se usa como customerId.
  // Debe quedar en null en producción (el backend debe resolver el cliente desde el token).
  private readonly customerIdPrueba: string | null = null;

  constructor(
    private reservationService: ReservationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Captura del usuario de Firebase: al recargar la página, currentUser puede tardar en estar listo
    this.authUnsub = onAuthStateChanged(getAuth(), (user) => {
      this.internalDatabaseUserId = user?.uid ?? '';
    });
    this.generarCalendario();
    this.cargarBarberias();
  }

  ngOnDestroy(): void {
    this.authUnsub?.();
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
          // Id del horario si el backend lo envía junto al empleado (sin valores fijos)
          scheduleId: emp.scheduleId ?? emp.id_horario ?? emp.horarioId ?? null,
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
        this.recalcularSlots();
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
    this.scheduleCache.clear();
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
    this.recalcularSlots(); // la duración cambió: algunos huecos dejan de caber
  }

  calcularTotal(): void {
    this.precioTotalCalculado = this.serviciosDisponibles
      .filter(s => this.selectedServicesIds.includes(s.id))
      .reduce((acc, current) => acc + (current.special_price || current.price || 0), 0);
  }

  // Suma de duraciones de los servicios elegidos (mínimo 30 si no hay dato)
  duracionTotalMin(): number {
    const total = this.serviciosDisponibles
      .filter(s => this.selectedServicesIds.includes(s.id))
      .reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
    return total > 0 ? total : 30;
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

  /**
   * Consulta el turno del barbero y sus reservas del día, y marca como ocupados
   * los slots que chocan con reservas existentes en la base de datos.
   */
  generarHorariosDisponibles(): void {
    const barbero = this.selectedBarbero;
    const fecha = this.selectedFecha;
    if (!barbero || !fecha) return;

    this.loadingHorarios = true;
    this.errorHorario = '';
    this.avisoOcupacion = '';

    this.obtenerSchedule(barbero).pipe(
      switchMap(({ schedule, fallo, sinHorario }): Observable<ResultadoHorario> => {
        const turno = this.extraerTurno(schedule, fecha);

        // Sin horario, sin turno ese día o de vacaciones: no hace falta consultar reservas
        if (!turno || turno.vacaciones) {
          return of({ turno: null, reservas: [], fallo, sinHorario, falloReservas: false });
        }

        return this.reservationService.getReservationsByEmployee(barbero.id, fecha).pipe(
          map((reservas: any): ResultadoHorario => ({
            turno, reservas, fallo: false, sinHorario: false, falloReservas: false
          })),
          catchError((err: any) => {
            // 404/409: el backend lo informa cuando el barbero todavía no tiene reservas
            const sinReservas = err?.status === 404 || err?.status === 409;
            if (!sinReservas) {
              console.error('No se pudieron cargar las reservas del barbero:', err?.status);
            }
            return of<ResultadoHorario>({
              turno, reservas: [], fallo: false, sinHorario: false, falloReservas: !sinReservas
            });
          })
        );
      })
    ).subscribe((r: ResultadoHorario) => {
      // Ignora respuestas viejas si el usuario ya cambió de barbero o de día
      if (this.selectedBarbero?.id !== barbero.id || this.selectedFecha !== fecha) return;

      this.loadingHorarios = false;

      if (!r.turno) {
        this.turnoActual = null;
        this.ocupadosActuales = [];
        this.slotsHorarios = [];
        if (r.fallo) {
          this.errorHorario = 'No se pudo cargar el horario del barbero. Intenta de nuevo.';
        } else {
          this.errorHorario = r.sinHorario
            ? 'Este barbero no tiene un horario configurado.'
            : 'El barbero no tiene turno para este día.';
          this.setEstadoBarbero(barbero, 'descanso', 'Sin turno');
        }
        return;
      }

      if (r.turno.vacaciones) {
        this.turnoActual = null;
        this.ocupadosActuales = [];
        this.slotsHorarios = [];
        this.errorHorario = 'El barbero está de vacaciones.';
        this.setEstadoBarbero(barbero, 'descanso', 'Vacaciones');
        return;
      }

      if (r.falloReservas) {
        this.avisoOcupacion = 'No se pudo consultar las reservas existentes; la disponibilidad puede no ser exacta.';
      }

      const lista = r.reservas?.data ?? r.reservas ?? [];
      this.ocupadosActuales = (Array.isArray(lista) ? lista : [])
        .filter((x: any) => x?.startTime && x?.endTime)
        .map((x: any) => ({
          ini: this.isoAMinutosLocal(x.startTime),
          fin: this.isoAMinutosLocal(x.endTime)
        }));
      this.turnoActual = r.turno;

      this.recalcularSlots();
      this.actualizarEstadoPorReservas(barbero, this.ocupadosActuales, r.turno);
    });
  }

  /** Reconstruye los slots con el turno, las reservas y la duración de los servicios actuales. */
  recalcularSlots(): void {
    if (!this.turnoActual) {
      this.slotsHorarios = [];
      return;
    }
    this.slotsHorarios = this.construirSlotsDeTiempo(
      this.turnoActual,
      this.ocupadosActuales,
      this.duracionTotalMin()
    );
    // Si la hora elegida ya no está disponible, se limpia
    if (this.selectedHora && !this.slotsHorarios.some(s => s.hora === this.selectedHora && s.disponible)) {
      this.selectedHora = '';
    }
  }

  /**
   * Horario del barbero: GET /schedule-service/empleado/{idEmpleado}.
   * Se guarda en caché (también cuando el barbero no tiene horario) para no repetir la consulta.
   * 404/409 = el barbero no tiene horario configurado; no es un error de red.
   */
  private obtenerSchedule(b: Barbero): Observable<ScheduleResultado> {
    if (this.scheduleCache.has(b.id)) {
      const cacheado = this.scheduleCache.get(b.id);
      return of<ScheduleResultado>({ schedule: cacheado, fallo: false, sinHorario: cacheado === null });
    }

    return this.reservationService.getScheduleById(b.id).pipe(
      map((res: any): ScheduleResultado => {
        const raw = res?.data ?? res;
        const tieneDatos = !!raw && (!Array.isArray(raw) || raw.length > 0);
        const schedule = tieneDatos ? res : null;
        this.scheduleCache.set(b.id, schedule);
        return { schedule, fallo: false, sinHorario: !tieneDatos };
      }),
      catchError((err: any) => {
        if (err?.status === 404 || err?.status === 409) {
          this.scheduleCache.set(b.id, null);
          return of<ScheduleResultado>({ schedule: null, fallo: false, sinHorario: true });
        }
        console.error('No se pudo cargar el horario del barbero:', err?.status);
        return of<ScheduleResultado>({ schedule: null, fallo: true, sinHorario: false });
      })
    );
  }

  /** Acepta objeto o lista, distintos nombres de campo y turnos por día de la semana. */
  private extraerTurno(schedule: any, fecha: string): Turno | null {
    const raw = schedule?.data ?? schedule;
    if (!raw) return null;
    const lista: any[] = Array.isArray(raw) ? raw : [raw];

    const [y, m, d] = fecha.split('-').map(Number);
    const js = new Date(y, m - 1, d).getDay();
    const dow = js === 0 ? 7 : js; // 1 = lunes ... 7 = domingo
    const en = ['', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const es = ['', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

    const diaDe = (x: any): number | null => {
      const v = x?.dayOfWeek ?? x?.day ?? x?.dia ?? x?.dia_semana;
      if (v === undefined || v === null) return null;
      if (typeof v === 'number') return v;
      const s = String(v).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (en.indexOf(s) > 0) return en.indexOf(s);
      if (es.indexOf(s) > 0) return es.indexOf(s);
      return Number(s) || null;
    };

    const sinDias = lista.every(x => diaDe(x) === null);
    const item = sinDias ? lista[0] : lista.find(x => diaDe(x) === dow);
    if (!item) return null;

    const hora = (...keys: string[]): string | null => {
      for (const k of keys) {
        const v = item[k];
        if (v) {
          const s = String(v);
          return s.includes('T') ? s.split('T')[1].slice(0, 5) : s.slice(0, 5);
        }
      }
      return null;
    };

    const inicio = hora('startTime', 'hora_inicio', 'horaInicio', 'start', 'openingTime', 'opening_time');
    const fin = hora('endTime', 'hora_fin', 'horaFin', 'end', 'closingTime', 'closing_time');
    if (!inicio || !fin) return null;

    const almuerzoInicio = hora('lunchStartTime', 'hora_inicio_almuerzo', 'horaInicioAlmuerzo', 'lunchStart');
    const almuerzoFin = hora('lunchEndTime', 'hora_fin_almuerzo', 'horaFinAlmuerzo', 'lunchEnd');
    const v = item['vacation'] ?? item['vacaciones'] ?? item['onVacation'] ?? false;
    const vacaciones = v === true || String(v).toLowerCase() === 'true';

    return { inicio, fin, almuerzoInicio, almuerzoFin, vacaciones };
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

  private horaAMinutos(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  private construirSlotsDeTiempo(turno: Turno, ocupados: RangoOcupado[], duracion: number): SlotHorario[] {
    const start = this.horaAMinutos(turno.inicio);
    const end = this.horaAMinutos(turno.fin);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [];

    // Almuerzo del barbero (si está configurado): no se puede reservar encima
    const almIni = turno.almuerzoInicio ? this.horaAMinutos(turno.almuerzoInicio) : NaN;
    const almFin = turno.almuerzoFin ? this.horaAMinutos(turno.almuerzoFin) : NaN;
    const hayAlmuerzo = Number.isFinite(almIni) && Number.isFinite(almFin) && almFin > almIni;

    const hoy = this.hoyColombia();
    const esHoy = this.selectedFecha === hoy;
    const diaPasado = this.selectedFecha < hoy; // formato YYYY-MM-DD: la comparación de texto es válida
    const ahora = this.isoAMinutosLocal(new Date().toISOString());

    const slots: SlotHorario[] = [];
    for (let min = start; min + 30 <= end; min += 30) {
      const hora = `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

      const pasado = diaPasado || (esHoy && min <= ahora);
      const noCabe = min + duracion > end;
      // Choca si el servicio completo [min, min + duracion) se cruza con una reserva existente o con el almuerzo
      const choca = ocupados.some(o => min < o.fin && min + duracion > o.ini);
      const enAlmuerzo = hayAlmuerzo && min < almFin && min + duracion > almIni;

      let motivo: string | undefined;
      if (pasado) motivo = 'Pasado';
      else if (choca) motivo = 'Ocupado';
      else if (enAlmuerzo) motivo = 'Almuerzo';
      else if (noCabe) motivo = 'Sin tiempo';

      slots.push({ hora, disponible: !motivo, motivoOcupado: motivo });
    }
    return slots;
  }

  private setEstadoBarbero(b: Barbero, estado: string, texto: string): void {
    b.estado = estado;
    b.estadoTexto = texto;
  }

  private actualizarEstadoPorReservas(b: Barbero, ocupados: RangoOcupado[], turno: Turno): void {
    const esHoy = this.selectedFecha === this.hoyColombia();
    const ahora = this.isoAMinutosLocal(new Date().toISOString());

    const ocupadoAhora = esHoy && ocupados.some(o => ahora >= o.ini && ahora < o.fin);
    const enAlmuerzoAhora = esHoy && !!turno.almuerzoInicio && !!turno.almuerzoFin &&
      ahora >= this.horaAMinutos(turno.almuerzoInicio) && ahora < this.horaAMinutos(turno.almuerzoFin);

    if (ocupadoAhora) this.setEstadoBarbero(b, 'ocupado', 'Ocupado');
    else if (enAlmuerzoAhora) this.setEstadoBarbero(b, 'almuerzo', 'Almuerzo');
    else this.setEstadoBarbero(b, 'libre', 'Libre');
  }

  seleccionarHora(slot: SlotHorario): void {
    if (slot.disponible) {
      this.selectedHora = slot.hora;
    }
  }

  // ───────────────────────── Crear reserva ─────────────────────────

  crearReserva(): void {
    if (this.isLoading) return;

    // UID de Firebase del usuario logueado, leído al momento de enviar
    const firebaseUid = getAuth().currentUser?.uid ?? this.internalDatabaseUserId;

    if (!firebaseUid) {
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

    const startTimeIso = `${this.selectedFecha}T${this.selectedHora}:00-05:00`;

    // Servicios: lista de números si todos los ids son numéricos; si no, se envían tal cual (texto)
    const rawServiceIds: string[] = this.selectedServicesIds.map((s: any) =>
      String(typeof s === 'object' ? (s.id ?? s.id_servicio) : s).trim()
    );
    const todosNumericos = rawServiceIds.every(id => /^\d+$/.test(id));
    const reservationServiceId: any[] = todosNumericos ? rawServiceIds.map(Number) : rawServiceIds;

    const customerId = this.sessionService.getClientId()|| '';         // usuario logueado (UID de Firebase)
    const employeeId = String(this.selectedBarbero.id || '').trim();   // id_empleado (UUID) del barbero elegido
    const barbershopId = String(this.selectedBarberiaId || '').trim(); // id_barberia (UUID) de la sede elegida

    // Validación previa: empleado y sede deben ser UUID, y ningún id puede repetirse en otro campo
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(employeeId) || !UUID_RE.test(barbershopId) ||
        customerId === employeeId || customerId === barbershopId) {
      console.error('❌ Ids inconsistentes, no se envía la reserva:', { customerId, employeeId, barbershopId });
      alert('Los datos del barbero o de la sede no son válidos. Recarga la página e inténtalo de nuevo.');
      return;
    }

    const payload : CreateReservationPayload = {
      customerId,
      employeeId,
      barbershopId,
      reservationServiceId,
      startTime: startTimeIso,
      notes: 'Reserva creada desde Angular'
    };

    console.log('📦 Payload enviado a /reservation-service/create:', JSON.stringify(payload, null, 2));

    this.isLoading = true;
    this.reservationService.createReservation(payload).subscribe({
      next: () => {
        this.isLoading = false;
        alert('¡Reserva creada exitosamente!');
        this.selectedHora = '';
        this.generarHorariosDisponibles(); // vuelve a leer la BD y marca el slot como ocupado
      },
      error: (err: any) => {
        this.isLoading = false;
        const body = err.error;
        const detalle = body?.data ?? body;
        console.error('❌ Error al crear reserva:', err.status, body, '\nPayload enviado:', payload);

        let mensaje: string =
          detalle?.message ||
          body?.message ||
          body?.error ||
          (typeof body === 'string' ? body : '') ||
          'Error al procesar la reserva';
        const codigo = detalle?.code ? ` [${detalle.code}]` : '';

        if (String(mensaje).includes('Failed to read HTTP message')) {
          mensaje = 'El servidor no pudo leer los datos de la reserva (formato del cuerpo). ' +
                    'Revisa la consola y avisa al equipo de backend.';
        }
        alert(`Atención del Sistema${codigo}: ${mensaje}`);
      }
    });
  }
}