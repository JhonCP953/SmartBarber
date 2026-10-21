import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import {
  BarberShopRegisterRequest,
  BarberShopResponse
} from '../../domain/models/barber-shop.model';
import {
  ScheduleRequest,
  ScheduleResponse
} from '../../domain/models/schedule.model';

@Injectable({
  providedIn: 'root'
})
export class BarberShopApiService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/barber-service`;
  private readonly employeeUrl = `${environment.apiUrl}/employee-service`;
  private readonly scheduleUrl = `${environment.apiUrl}/schedule-service`;

  createBarberShop(
    request: BarberShopRegisterRequest
  ): Observable<BarberShopResponse> {
    return this.http.post<BarberShopResponse>(
      `${this.apiUrl}/create-barber`,
      request
    );
  }

  getAll(): Observable<BarberShopResponse[]> {
    return this.http.get<BarberShopResponse[]>(
      `${this.apiUrl}/obtener-barberia-nombre`
    );
  }

  getById(id: string): Observable<BarberShopResponse> {
    return this.http.get<BarberShopResponse>(
      `${this.apiUrl}/id/${encodeURIComponent(id)}`
    );
  }

  getByDocument(document: string): Observable<BarberShopResponse> {
    return this.http.get<BarberShopResponse>(
      `${this.apiUrl}/document/${encodeURIComponent(document)}`
    );
  }

  getByCompanyName(companyName: string): Observable<BarberShopResponse[]> {
    return this.http.get<BarberShopResponse[]>(
      `${this.apiUrl}/company-name/${encodeURIComponent(companyName)}`
    );
  }

  update(
    id: string,
    request: BarberShopRegisterRequest
  ): Observable<BarberShopResponse> {
    return this.http.put<BarberShopResponse>(
      `${this.apiUrl}/update-barber/${encodeURIComponent(id)}`,
      request
    );
  }

  getEmployeesByBarbershop(barbershopId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(
      `${this.employeeUrl}/barbershop/${encodeURIComponent(barbershopId)}`
    );
  }

  getEmpleadoPorId(id: string): Observable<unknown> {
    return this.http.get<unknown>(
      `${this.employeeUrl}/id/${encodeURIComponent(id)}`
    );
  }

  getEmpleadoPorDocumento(document: string): Observable<unknown> {
    return this.http.get<unknown>(
      `${this.employeeUrl}/documento/${encodeURIComponent(document)}`
    );
  }

  obtenerHorarioEmpleadoPorEmpleadoId(
    employeeId: string
  ): Observable<ScheduleResponse> {
    return this.http.get<ScheduleResponse>(
      `${this.scheduleUrl}/empleado/${encodeURIComponent(employeeId)}`
    );
  }

  crearHorarioEmpleado(
    payload: ScheduleRequest
  ): Observable<ScheduleResponse> {
    return this.http.post<ScheduleResponse>(
      `${this.scheduleUrl}/crear-schedule`,
      payload
    );
  }

  actualizarHorarioEmpleado(
    id: number,
    payload: ScheduleRequest
  ): Observable<ScheduleResponse> {
    return this.http.put<ScheduleResponse>(
      `${this.scheduleUrl}/actualizar-schedule/${encodeURIComponent(String(id))}`,
      payload
    );
  }

  obtenerDiasNoLaborables(barberId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(
      `${this.apiUrl}/festivos/${encodeURIComponent(barberId)}`
    );
  }

  agregarDiaNoLaborable(
    barberId: string,
    payload: unknown
  ): Observable<unknown> {
    return this.http.post<unknown>(
      `${this.apiUrl}/festivos/${encodeURIComponent(barberId)}`,
      payload
    );
  }

  eliminarDiaNoLaborable(festivoId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/festivos/${encodeURIComponent(festivoId)}`
    );
  }
}