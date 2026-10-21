import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { getAuth } from 'firebase/auth';
import { ReservationService } from '../../services/reservation.service';
import { Barberia, Barbero, SlotHorario } from '../../models/reservation.model';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css']
})
export class AppointmentComponent implements OnInit {
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

  slotsHorarios: SlotHorario[] = [];
  isLoading: boolean = false;

  constructor(
    private reservationService: ReservationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.generarCalendario();
    this.cargarBarberias();
  }

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
    this.reservationService.getEmployeesByBarberiaId(barberiaId).subscribe({
      next: (res: any) => {
        const rawList = res.data || res;
        const list = Array.isArray(rawList) ? rawList : (rawList ? [rawList] : []);

        this.barberosFiltrados = list.map((emp: any) => ({
          id: emp.id || emp.id_empleado || emp.userId,
          name: emp.name || emp.nombre || 'Barbero',
          especialidad: emp.specialty || emp.especialidad || 'Barbero Profesional',
          estado: 'libre',
          estadoTexto: 'Libre',
          foto: emp.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
        }));

        if (this.barberosFiltrados.length > 0) {
          this.selectedBarbero = this.barberosFiltrados[0];
          if (this.selectedDia) {
            this.generarHorariosDisponibles();
          }
        } else {
          this.selectedBarbero = null;
          this.slotsHorarios = [];
        }
      },
      error: (err: any) => {
        console.error('Error al cargar empleados:', err);
        this.barberosFiltrados = [];
        this.selectedBarbero = null;
        this.slotsHorarios = [];
      }
    });
  }

  cargarServiciosPorBarberia(barberiaId: string): void {
    this.loadingServicios = true;
    this.reservationService.getServicesByBarberiaId(barberiaId).subscribe({
      next: (data: any) => {
        this.loadingServicios = false;
        const rawList = data.data || data;
        const list = Array.isArray(rawList) ? rawList : (rawList ? [rawList] : []);
        
        this.serviciosDisponibles = list.map((item: any) => ({
          ...item,
          id: item.id || item.id_servicio,
          name: item.name || item.nombre,
          price: item.price || item.precio || 0,
          isActive: item.status ?? item.isActive ?? true
        }));

        if (this.serviciosDisponibles.length > 0) {
          // Seleccionamos el ID asegurando el tipo correcto (número o string según tu backend)
          const primerId = this.serviciosDisponibles[0].id;
          this.selectedServicesIds = [primerId];
          this.calcularTotal();
        } else {
          this.selectedServicesIds = [];
          this.precioTotalCalculado = 0;
        }
      },
      error: (err: any) => {
        this.loadingServicios = false;
        console.error('Error al cargar servicios de la barbería:', err);
        this.serviciosDisponibles = [];
        this.selectedServicesIds = [];
        this.precioTotalCalculado = 0;
      }
    });
  }

  onBarberiaChange(barberiaId: string): void {
    this.selectedBarberiaId = barberiaId;
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
    const year = this.currentDate.getFullYear();
    const month = (this.currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = dia.toString().padStart(2, '0');
    
    this.selectedFecha = `${year}-${month}-${dayStr}`;

    if (this.selectedBarbero) {
      this.generarHorariosDisponibles();
    }
  }

  generarHorariosDisponibles(): void {
    if (!this.selectedBarbero) return;

    this.reservationService.getScheduleByEmployeeId(this.selectedBarbero.id).subscribe({
      next: (scheduleRes: any) => {
        const data = scheduleRes.data || scheduleRes;
        const horaInicio = data.startTime || data.hora_inicio || '08:00';
        const horaFin = data.endTime || data.hora_fin || '18:00';
        
        this.slotsHorarios = this.construirSlotsDeTiempo(horaInicio, horaFin, data.ocupados || data.bookedSlots || []);
      },
      error: (err) => {
        console.warn('⚠️ schedule-service con datos por defecto de respaldo:', err);
        this.slotsHorarios = this.construirSlotsDeTiempo('08:00', '18:00', []);
      }
    });
  }

  private construirSlotsDeTiempo(horaInicio: string, horaFin: string, ocupados: any[] = []): SlotHorario[] {
    const toMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const start = toMinutes(horaInicio);
    const end = toMinutes(horaFin);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [];

    const busyTimes = new Set<string>(ocupados.map((ocupado: any) => {
      const time = typeof ocupado === 'string'
        ? ocupado
        : ocupado?.startTime ?? ocupado?.hora ?? ocupado?.time ?? '';
      return typeof time === 'string' ? time.slice(0, 5) : '';
    }));

    const slots: SlotHorario[] = [];
    for (let minute = start; minute + 30 <= end; minute += 30) {
      const hora = `${Math.floor(minute / 60).toString().padStart(2, '0')}:${(minute % 60).toString().padStart(2, '0')}`;
      const disponible = !busyTimes.has(hora);
      slots.push({
        hora,
        disponible,
        motivoOcupado: disponible ? undefined : 'Ocupado'
      });
    }
    return slots;
  }

  seleccionarHora(slot: SlotHorario): void {
    if (slot.disponible) {
      this.selectedHora = slot.hora;
    }
  }

 crearReserva(): void {
    if (!this.selectedBarbero || !this.selectedHora || !this.selectedFecha) {
      alert('Por favor selecciona un barbero, una fecha y un horario válido.');
      return;
    }

    if (!this.selectedServicesIds || this.selectedServicesIds.length === 0) {
      alert('⚠️ Debes seleccionar al menos un servicio para la reserva.');
      return;
    }

    this.isLoading = true;
    
    // Formato UTC exacto con 'Z' idéntico al que probaste en Postman
    const startTimeIso = `${this.selectedFecha}T${this.selectedHora}:00Z`;

    // Obtener UID de Firebase activo de forma dinámica sin datos quemados
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const customerId = currentUser ? currentUser.uid : '';

    if (!customerId) {
      this.isLoading = false;
      alert('⚠️ No hay una sesión de usuario activa.');
      return;
    }

    // Asegurar que los IDs de servicios sean números enteros puros limpios
    const cleanServiceIds = this.selectedServicesIds.map((s: any) => {
      const idVal = typeof s === 'object' ? (s.id || s.id_servicio) : s;
      return Number(idVal);
    }).filter(id => !isNaN(id));

    // Estructura exacta y limpia idéntica a Postman
    const payload = {
      customerId: customerId,
      employeeId: this.selectedBarbero.id,
      barbershopId: this.selectedBarberiaId,
      reservationServiceId: cleanServiceIds,
      startTime: startTimeIso,
      notes: 'Reserva creada desde Angular'
    };

    console.log('📦 Payload exacto idéntico a Postman enviado al backend:', payload);

    this.reservationService.createReservation(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        alert('¡Reserva creada exitosamente!');
        console.log('✅ Respuesta exitosa:', res);
        this.selectedHora = '';
        this.generarHorariosDisponibles();
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('❌ Error al crear reserva:', err);
        const mensajeError = err.error?.message || err.error?.data?.message || 'Error al procesar la reserva';
        alert(`Atención del Sistema: ${mensajeError}`);
      }
    });
  }
}