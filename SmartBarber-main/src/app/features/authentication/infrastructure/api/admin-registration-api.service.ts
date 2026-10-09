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
  AdminRegistrationRepository
} from '../../domain/repositories/admin-registration.repository';

import {
  CreateAdminRequest,
  CreateAdminResponse,
  CreateUserRequest,
  CreateUserResponse
} from '../../domain/models/admin-registration.model';

import {
  BarberShopRegisterRequest,
  BarberShopResponse
} from '../../../barber-shop/domain/models/barber-shop.model';

@Injectable()
export class AdminRegistrationApiService
  extends AdminRegistrationRepository {

  private readonly http =
    inject(HttpClient);

  private readonly baseUrl =
    environment.apiUrl;

  override createBarberShop(
    request: BarberShopRegisterRequest
  ): Observable<BarberShopResponse | null> {

    return this.http.post<BarberShopResponse | null>(
      `${this.baseUrl}/barber-service/create-barber`,
      request
    );
  }

  override findBarberShopByName(
    name: string
  ): Observable<BarberShopResponse> {

    return this.http.get<BarberShopResponse>(
      `${this.baseUrl}/barber-service/name/${encodeURIComponent(name)}`
    );
  }

  override createUser(
    request: CreateUserRequest
  ): Observable<CreateUserResponse | null> {

    return this.http.post<CreateUserResponse | null>(
      `${this.baseUrl}/user-service/crear-usuario`,
      request
    );
  }

  override createAdmin(
    request: CreateAdminRequest
  ): Observable<CreateAdminResponse | null> {

    return this.http.post<CreateAdminResponse | null>(
      `${this.baseUrl}/employee-service/crear-empleado`,
      request
    );
  }
}