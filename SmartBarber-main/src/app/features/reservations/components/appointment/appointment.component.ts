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

  selectedServicesIds: number[] = [1];
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
        
        if (barberiaIdParam && this.barberias.some(b => b.id === barberiaIdParam)) {
          this.selectedBarberiaId = barberiaIdParam;
        } else if (this.barberias.length > 0) {
          this.selectedBarberiaId = this.barberias[0].id;
        }

        if (this.selectedBarberiaId) {
          this.cargarEmpleadosPorBarberia(this.selectedBarberiaId);
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
        const list = Array.isArray(rawList) ? rawList : [rawList];

        this.barberosFiltrados = list.map((emp: any) => ({
          id: emp.id || emp.id_empleado,
          name: emp.name || emp.nombre,
          especialidad: emp.specialty || emp.especialidad || 'Barbero Profesional',
          estado: 'libre',
          estadoTexto: 'Libre',
          foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
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
      }
    });
  }

  onBarberiaChange(barberiaId: string): void {
    this.selectedBarberiaId = barberiaId;
    if (barberiaId) {
      this.cargarEmpleadosPorBarberia(barberiaId);
    }
  }

  onBarberoSelect(barbero: Barbero): void {
    this.selectedBarbero = barbero;
    this.selectedHora = '';
    if (this.selectedDia) {
      this.generarHorariosDisponibles();
    }
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

    this.slotsHorarios = [
      { hora: '09:00', disponible: true },
      { hora: '10:00', disponible: false, motivoOcupado: 'Ocupado' },
      { hora: '11:00', disponible: true },
      { hora: '14:00', disponible: true },
      { hora: '15:00', disponible: true },
      { hora: '16:00', disponible: false, motivoOcupado: 'Ocupado' }
    ];
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

    this.isLoading = true;
    
    // Formato ISO estricto que Java LocalDateTime / Instant procesa sin error
    const startTimeIso = `${this.selectedFecha}T${this.selectedHora}:00-05:00`;

    // Estructura limpia basada estrictamente en los nombres de tu DTO de backend
    const payload = {
      customerId: "6ecd45c9-79ac-43e1-9796-9eaf09e48357",
      barbershopId: this.barberias[0].id,
      employeeId: this.selectedBarbero.id,
      reservationServiceId: this.selectedServicesIds, // Asegura que sea un array de números o strings según tu backend
      startTime: startTimeIso,
      notes: 'Reserva creada desde Angular'
    };

    console.log('Payload enviado al backend:', payload);

    this.reservationService.createReservation(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        alert('¡Reserva creada exitosamente!');
        console.log('Respuesta exitosa:', res);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error al crear reserva:', err);
        
        // Capturamos el mensaje de negocio que manda tu backend en la excepción
        const mensajeError = err.error?.message || err.error?.data?.message || 'Error al procesar la reserva';
        alert(`Atención del Sistema: ${mensajeError}`);
      }
    });
  } 
}