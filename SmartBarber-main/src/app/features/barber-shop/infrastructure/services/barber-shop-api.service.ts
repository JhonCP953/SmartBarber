import {
    Injectable,
    inject
} from '@angular/core';

import {
    HttpClient
} from '@angular/common/http';

import {
    Observable
} from 'rxjs';

import {
    environment
} from '../../../../../environments/environment';

import {
    BarberShopRegisterRequest,
    BarberShopResponse
} from '../../domain/models/barber-shop.model';

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

    /**
     * Obtener barbería por nombre
     */
    getByName(
        name: string
    ): Observable<BarberShopResponse> {

        return this.http.get<BarberShopResponse>(
            `${this.apiUrl}/name/${encodeURIComponent(name)}`
        );
    }

    /**
     * Obtener barbería por documento
     */
    getByDocument(
        document: string
    ): Observable<BarberShopResponse> {

        return this.http.get<BarberShopResponse>(
            `${this.apiUrl}/document/${encodeURIComponent(document)}`
        );
    }

    /**
     * Obtener barberías por razón social
     */
    getByCompanyName(
        companyName: string
    ): Observable<BarberShopResponse[]> {

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
}
