export interface CreateReservationPayload {
  customerId: string;
  employeeId: string;
  reservationServiceId: number[];
  startTime: string;
  notes: string;
}

export interface Barberia {
  id: string;
  name: string;
  description: string;
  location: string;
  phone?: string;
  status?: string;
}

export interface Barbero {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  especialidad?: string;
  estado?: string;
  estadoTexto?: string;
  foto?: string;
}

export interface SlotHorario {
  hora: string;
  disponible: boolean;
  motivoOcupado?: string;
}