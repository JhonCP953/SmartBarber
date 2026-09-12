import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BarberShopRegisterRequest, BarberShopResponse } from '../../domain/models/barber-shop.model';
import { environment } from '../../../../../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class BarberShopApiService {

    private readonly apiUrl =
  `${environment.apiUrl}/barber-service`;

    constructor(
        private readonly http: HttpClient
    ) { }

    crearBarberia(
        data: BarberShopRegisterRequest
    ): Observable<BarberShopResponse> {

        return this.http.post<BarberShopResponse>(
            `${this.apiUrl}/crear-barberia`,
            data
        );
    }

    obtenerBarberias(): Observable<BarberShopResponse[]> {

        return this.http.get<BarberShopResponse[]>(
            `${this.apiUrl}/obtener-barberia-nombre`
        );
    }
}