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
    ClientProfile,
    UpdateProfileRequest
} from '../../domain/models/profile.model';

import {
    UserProfile
} from '../../domain/models/user-profile.model';

import {
    ProfileRepository
} from '../../domain/repositories/profile.repository';


@Injectable()
export class ProfileApiService
    extends ProfileRepository {

    private readonly http =
        inject(HttpClient);

    private readonly apiUrl =
        environment.apiUrl;


    override getProfile():
        Observable<UserProfile> {

        return this.http.get<UserProfile>(
            `${this.apiUrl}/api/auth/me`
        );
    }


    override updateProfile(
        clientId: string,
        request: UpdateProfileRequest
    ): Observable<ClientProfile> {

        return this.http.put<ClientProfile>(
            `${this.apiUrl}/client-service/actualizar-cliente/${clientId}`,
            request
        );
    }
}