import { Barbero } from '../models/reservation.model';

const FOTO_POR_DEFECTO =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

/** El backend responde { data: [...] } o directamente [...] / objeto: normaliza a lista. */
export function extraerLista<T = any>(res: any): T[] {
  const raw = res?.data ?? res;
  return Array.isArray(raw) ? raw : (raw ? [raw] : []);
}

export function idBarberia(b: any): string {
  return b?.id || b?.id_barberia;
}

export function idServicio(s: any): number | undefined {
  return s?.id ?? s?.id_servicio;
}

export function toBarbero(emp: any): Barbero {
  return {
    id: emp.id || emp.id_empleado,
    name: emp.name || emp.nombre,
    especialidad: emp.specialty || emp.especialidad || 'Barbero Profesional',
    // Id del horario si el backend lo envía junto al empleado (sin valores fijos)
    scheduleId: emp.scheduleId ?? emp.id_horario ?? emp.horarioId ?? null,
    estado: 'libre',
    estadoTexto: 'Libre',
    foto: FOTO_POR_DEFECTO
  };
}
