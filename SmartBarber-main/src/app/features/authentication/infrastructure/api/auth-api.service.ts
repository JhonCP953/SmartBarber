import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthRepository } from '../../domain/repositories/auth.repository';
import { AuthProfileResponse } from '../../domain/models/auth-session.model';

@Injectable()
export class AuthApiService implements AuthRepository {

    private readonly http = inject(HttpClient);

    /*
     * Debe coincidir con la ruta que implemente/exponga
     * el backend para consultar el perfil autenticado.
     *
     * No está confirmada en el Insomnia disponible.
     */
    private readonly apiUrl = '/api/auth/me';

    getAuthenticatedProfile():
        Observable<AuthProfileResponse> {

        return this.http.get<AuthProfileResponse>(
            this.apiUrl
        );
    }
}