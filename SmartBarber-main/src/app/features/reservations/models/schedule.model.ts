import { RangoOcupado } from './reservation.model';

export interface Turno {
  inicio: string;                 // "08:00"
  fin: string;                    // "18:00"
  almuerzoInicio: string | null;  // "12:00"
  almuerzoFin: string | null;     // "13:00"
  vacaciones: boolean;
}

export interface ScheduleResultado {
  schedule: any | null;
  fallo: boolean;
  sinHorario: boolean;
}

export interface ResultadoHorario {
  turno: Turno | null;
  ocupados: RangoOcupado[];
  fallo: boolean;         // falló la carga del horario (red / servidor)
  sinHorario: boolean;    // el barbero no tiene horario configurado
  falloReservas: boolean; // falló la consulta de reservas (no por "sin reservas")
}

export interface EstadoBarbero {
  estado: 'libre' | 'ocupado' | 'almuerzo' | 'descanso';
  texto: string;
}
