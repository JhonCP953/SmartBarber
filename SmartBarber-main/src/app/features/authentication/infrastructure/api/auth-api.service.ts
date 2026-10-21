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
    AuthRepository
} from '../../domain/repositories/auth.repository';

import {
    BackendAuthenticationResponse
} from '../../domain/models/auth-session.model';


@Injectable({
    providedIn: 'root'
})
export class AuthApiService
    extends AuthRepository {


    private readonly http =
        inject(HttpClient);


    private readonly apiUrl =
        `${environment.apiUrl}/auth/verify`;


    override verifyAuthentication():
        Observable<BackendAuthenticationResponse> {

        return this.http.post<BackendAuthenticationResponse>(
            this.apiUrl,
            null
        );

    }

}