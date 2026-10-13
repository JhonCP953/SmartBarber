import {
    Observable
} from 'rxjs';

import {
    CreateUserRequest,
    CreateUserResponse,
    CreateAdminRequest,
    CreateAdminResponse,
    BarberShopOnboardingRequest,
    BarberShopOnboardingResponse
} from '../models/admin-registration.model';

import {
    BarberShopRegisterRequest,
    BarberShopResponse
} from '../../../barber-shop/domain/models/barber-shop.model';


export abstract class AdminRegistrationRepository {


    /*
     * =====================================================
     * MÉTODOS ANTIGUOS
     * =====================================================
     */

    abstract createBarberShop(
        request: BarberShopRegisterRequest
    ):
        Observable<BarberShopResponse>;


    abstract createUser(
        request: CreateUserRequest
    ):
        Observable<CreateUserResponse>;


    abstract createAdmin(
        request: CreateAdminRequest
    ):
        Observable<CreateAdminResponse>;


    /*
     * =====================================================
     * NUEVO ONBOARDING
     * =====================================================
     */

    abstract onboarding(
        request: BarberShopOnboardingRequest
    ):
        Observable<BarberShopOnboardingResponse>;


    /*
     * =====================================================
     * CONSULTAR BARBERÍA POR NOMBRE
     * =====================================================
     */

    abstract findBarberShopByName(
        name: string
    ):
        Observable<BarberShopResponse>;

}