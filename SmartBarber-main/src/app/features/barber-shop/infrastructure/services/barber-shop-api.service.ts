import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BarberShopRegisterRequest, BarberShopResponse } from '../../domain/models/barber-shop.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BarberShopApiService {

    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/barber-service`;
    
    // URL específica para el microservicio de horarios que probaste en Insomnia
    private readonly scheduleUrl = `${environment.apiUrl}/schedule-service`;

    /**
     * Crear barbería
     */
    createBarberShop(
        request: BarberShopRegisterRequest
    ): Observable<BarberShopResponse> {
        return this.http.post<BarberShopResponse>(
            `${this.apiUrl}/create-barber`,
            request
        );
    }

    /**
     * Obtener todas las barberías (Método necesario para listar en la tabla)
     */
    getAll(): Observable<BarberShopResponse[]> {
        return this.http.get<BarberShopResponse[]>(this.apiUrl);
    }

    /**
     * Obtener barbería por ID
     */
    getById(
        id: string
    ): Observable<BarberShopResponse> {
        return this.http.get<BarberShopResponse>(
            `${this.apiUrl}/id/${id}`
        );
    }

    obtenerBarberias(companyName: string): Observable<BarberShopResponse[]> {
        return this.http.get<BarberShopResponse[]>(
            `${this.apiUrl}/company-name/${encodeURIComponent(companyName)}`
        );
    }

    /**
     * Actualizar barbería
     */
    update(
        id: string,
        request: BarberShopRegisterRequest
    ): Observable<BarberShopResponse> {
        return this.http.put<BarberShopResponse>(
            `${this.apiUrl}/update-barber/${id}`,
            request
        );
    }

    // --- Métodos de Configuración, Horarios y Días No Laborables ---

    obtenerConfiguracionBarberia(barberId: number | string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/configuracion/${barberId}`);
    }

    actualizarConfiguracionBarberia(barberId: number | string, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/configuracion/${barberId}`, data);
    }

    obtenerHorarios(barberId: number | string): Observable<any[]> {
        return this.http.get<any[]>(`${this.scheduleUrl}/obtener-schedule/${barberId}`);
    }

    /**
     * Conectado al endpoint POST /schedule-service/crear-schedule que validaste en Insomnia
     */
    actualizarHorarios(barberId: number | string, horarios: any[]): Observable<any> {
        return this.http.post<any>(`${this.scheduleUrl}/crear-schedule`, {
            id_barberia: barberId,
            horarios: horarios
        });
    }

    obtenerDiasNoLaborables(barberId: number | string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/festivos/${barberId}`);
    }

    agregarDiaNoLaborable(barberId: number | string, festivo: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/festivos/${barberId}`, festivo);
    }

    eliminarDiaNoLaborable(festivoId: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/festivos/${festivoId}`);
    }
}

export { BarberShopResponse };