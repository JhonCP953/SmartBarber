import { Observable } from 'rxjs';

import {
    CreateAdminRequest,
    CreateAdminResponse
} from '../models/admin-registration.model';

import {
    BarberShopRegisterRequest,
    BarberShopResponse
} from '../../../barber-shop/domain/models/barber-shop.model';

export abstract class AdminRegistrationRepository {

    abstract createUser(
        firebaseId: string
    ): Observable<any>;

    abstract createAdmin(
        data: CreateAdminRequest
    ): Observable<CreateAdminResponse>;

    abstract createBarberShop(
        data: BarberShopRegisterRequest
    ): Observable<BarberShopResponse>;
}