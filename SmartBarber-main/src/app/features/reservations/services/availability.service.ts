import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Barbero } from '../models/reservation.model';
import { ResultadoHorario, ScheduleResultado } from '../models/schedule.model';
import { ReservationService } from './reservation.service';
import { extraerTurno, mapOcupados } from '../utils/schedule.utils';

/**
 * Orquesta "horario del barbero + reservas del día" y devuelve un resultado listo
 * para que el componente pinte los slots. No toca la UI.
 */
@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private readonly reservationService = inject(ReservationService);
  private readonly scheduleCache = new Map<string, any>();

  clearCache(): void {
    this.scheduleCache.clear();
  }

  getDisponibilidad(barbero: Barbero, fecha: string): Observable<ResultadoHorario> {
    return this.obtenerSchedule(barbero).pipe(
      switchMap(({ schedule, fallo, sinHorario }): Observable<ResultadoHorario> => {
        const turno = extraerTurno(schedule, fecha);

        // Sin horario, sin turno ese día o de vacaciones: no hace falta consultar reservas
        if (!turno || turno.vacaciones) {
          return of({ turno, ocupados: [], fallo, sinHorario, falloReservas: false });
        }

        return this.reservationService.getReservationsByEmployee(barbero.id, fecha).pipe(
          map((reservas: any): ResultadoHorario => ({
            turno, ocupados: mapOcupados(reservas), fallo: false, sinHorario: false, falloReservas: false
          })),
          catchError((err: any) => {
            // 404/409: el backend lo informa cuando el barbero todavía no tiene reservas
            const sinReservas = err?.status === 404 || err?.status === 409;
            if (!sinReservas) {
              console.error('No se pudieron cargar las reservas del barbero:', err?.status);
            }
            return of<ResultadoHorario>({
              turno, ocupados: [], fallo: false, sinHorario: false, falloReservas: !sinReservas
            });
          })
        );
      })
    );
  }

  /**
   * GET /schedule-service/empleado/{idEmpleado}.
   * Se guarda en caché (también cuando no tiene horario). 404/409 = sin horario configurado.
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
}
