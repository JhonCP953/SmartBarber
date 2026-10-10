import {
  Observable
} from 'rxjs';

import {
  CreateUserRequest,
  CreateUserResponse,
  CreateAdminRequest,
  CreateAdminResponse
} from '../models/admin-registration.model';

import {
  BarberShopRegisterRequest,
  BarberShopResponse
} from '../../../barber-shop/domain/models/barber-shop.model';

export abstract class AdminRegistrationRepository {

  abstract createBarberShop(
    request: BarberShopRegisterRequest
  ): Observable<BarberShopResponse>;

  abstract createUser(
    request: CreateUserRequest
  ): Observable<CreateUserResponse>;

  abstract createAdmin(
    request: CreateAdminRequest
  ): Observable<CreateAdminResponse>;
}