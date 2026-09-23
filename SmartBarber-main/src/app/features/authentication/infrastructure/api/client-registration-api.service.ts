import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import {
  CreateClientRequest,
  CreateClientResponse,
  CreateUserRequest,
  CreateUserResponse
} from '../../domain/models/client-registration.model';

import { ClientRegistrationRepository } from '../../domain/repositories/client-registration.repository';

@Injectable()
export class ClientRegistrationApiService
  extends ClientRegistrationRepository {

  private readonly http = inject(HttpClient);

  private readonly userApiUrl =
    `${environment.apiUrl}/user-service`;

  private readonly clientApiUrl =
    `${environment.apiUrl}/client-service`;

  override createUser(
    request: CreateUserRequest
  ): Observable<CreateUserResponse> {

    return this.http.post<CreateUserResponse>(
      `${this.userApiUrl}/crear-usuario`,
      request
    );
  }

  override createClient(
    request: CreateClientRequest
  ): Observable<CreateClientResponse> {

    return this.http.post<CreateClientResponse>(
      `${this.clientApiUrl}/crear-cliente`,
      request
    );
  }
}