import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BarberShopRegisterRequest, BarberShopResponse } from '../../domain/models/barber-shop.model';
import { environment } from '../../../../../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class BarberShopApiService {

    private readonly http =
        inject(HttpClient);

    private readonly apiUrl =
  `${environment.apiUrl}/barber-service`;

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
     * Obtener todas las barberías
     *
     * Backend esperado:
     * GET /barber-service
     */
    getAll(): Observable<BarberShopResponse[]> {

        return this.http.get<BarberShopResponse[]>(
            this.apiUrl
        );
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

    obtenerBarberias(): Observable<BarberShopResponse[]> {

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

    // --- Métodos agregados para Configuración, Horarios y Días No Laborables (PS-30 a PS-33) ---

    obtenerConfiguracionBarberia(barberId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/configuracion/${barberId}`);
    }

    actualizarConfiguracionBarberia(barberId: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/configuracion/${barberId}`, data);
    }

    obtenerHorarios(barberId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/horarios/${barberId}`);
    }

    actualizarHorarios(barberId: number, horarios: any[]): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/horarios/${barberId}`, horarios);
    }

    obtenerDiasNoLaborables(barberId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/festivos/${barberId}`);
    }

    agregarDiaNoLaborable(barberId: number, festivo: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/festivos/${barberId}`, festivo);
    }

    eliminarDiaNoLaborable(festivoId: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/festivos/${festivoId}`);
    }
}
