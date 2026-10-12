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

    getEmpleados(): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/employee-service`);
    }
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
     getAll(): Observable<any> {
        // Asegúrate de que apunte al endpoint correcto de tu backend para listar
        return this.http.get<any>(`${environment.apiUrl}/barber-service`); 
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
   // Obtener empleado por su ID o UUID exacto según la colección de Insomnia
    getEmpleadoPorId(id: string): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/employee-service/id/${id}`);
    }

    // O si prefieres buscar por documento como se ve en tu Insomnia:
    getEmpleadoPorDocumento(documento: string): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/employee-service/documento/${documento}`);
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

 // --- Métodos para el Schedule Service / Horario Empleado ---

  // Obtener horario de empleado por su ID numérico (ej: /schedule-service/id/3)
    obtenerHorarioEmpleadoPorId(id: number | string): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/schedule-service/id/${id}`);
    }

    // Crear horario de empleado (POST que ya tienes en Insomnia)
    crearHorarioEmpleado(payload: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/schedule-service/crear-schedule`, payload);
    }

    actualizarHorarioEmpleado(id: number | string, payload: any): Observable<any> {
        return this.http.put<any>(`${environment.apiUrl}/schedule-service/actualizar-schedule/${id}`, payload);
    }


    //Dias festivos 

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