import { Observable } from 'rxjs';

import {
  CreateClientRequest,
  CreateClientResponse,
  CreateUserRequest,
  CreateUserResponse
} from '../models/client-registration.model';

export abstract class ClientRegistrationRepository {

  abstract createUser(
    request: CreateUserRequest
  ): Observable<CreateUserResponse>;

  abstract createClient(
    request: CreateClientRequest
  ): Observable<CreateClientResponse>;
}