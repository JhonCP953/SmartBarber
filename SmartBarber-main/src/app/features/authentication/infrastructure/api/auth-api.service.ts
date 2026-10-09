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
    BackendRole
} from '../../domain/models/auth-session.model';

@Injectable({
    providedIn: 'root'
})
export class AuthApiService
    implements AuthRepository {

    private readonly http =
        inject(HttpClient);

    private readonly apiUrl =
        `${environment.apiUrl}/auth/verify`;

    verifyAuthentication():
        Observable<BackendRole> {

        return this.http.post<BackendRole>(
            this.apiUrl,
            null
        );
    }
}