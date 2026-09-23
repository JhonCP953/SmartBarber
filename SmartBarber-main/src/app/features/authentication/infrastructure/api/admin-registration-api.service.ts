import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
    CreateAdminRequest,
    CreateAdminResponse
} from '../../domain/models/admin-registration.model';

import {
    BarberShopRegisterRequest,
    BarberShopResponse
} from '../../../barber-shop/domain/models/barber-shop.model';

import {
    AdminRegistrationRepository
} from '../../domain/repositories/admin-registration.repository';

import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AdminRegistrationApiService
    extends AdminRegistrationRepository {

    private readonly userApiUrl =
        `${environment.apiUrl}/user-service`;

    private readonly adminApiUrl =
        `${environment.apiUrl}/admin-service`;

    private readonly barberApiUrl =
        `${environment.apiUrl}/barber-service`;

    constructor(
        private readonly http: HttpClient
    ) {
        super();
    }

    override createUser(
        firebaseId: string
    ): Observable<any> {

        return this.http.post(
            `${this.userApiUrl}/crear-usuario`,
            {
                firebaseId
            }
        );
    }

    override createAdmin(
        data: CreateAdminRequest
    ): Observable<CreateAdminResponse> {

        return this.http.post<CreateAdminResponse>(
            `${this.adminApiUrl}/crear-admin`,
            data
        );
    }

    override createBarberShop(
        data: BarberShopRegisterRequest
    ): Observable<BarberShopResponse> {

        return this.http.post<BarberShopResponse>(
            `${this.barberApiUrl}/create-barber`,
            data
        );
    }
}