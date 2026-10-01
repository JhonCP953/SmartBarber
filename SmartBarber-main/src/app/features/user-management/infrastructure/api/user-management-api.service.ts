import {
    Injectable,
    inject
} from '@angular/core';

import {
    HttpClient
} from '@angular/common/http';

import {
    Observable,
    map
} from 'rxjs';

import {
    environment
} from '../../../../../environments/environment';

import {
    ManagedUser,
    UpdateUserStatusRequest
} from '../../domain/models/user-management.model';

import {
    UserManagementRepository
} from '../../domain/repositories/user-management.repository';


interface UserApiResponse {

    id: string;

    firebaseId: string;

    status: string;

    createAt: string | null;

    updateAt: string | null;
}


@Injectable()
export class UserManagementApiService
    extends UserManagementRepository {


    private readonly http =
        inject(HttpClient);


    private readonly apiUrl =
        environment.apiUrl;


    override getUserById(
        userId: string
    ): Observable<ManagedUser> {

        return this.http.get<UserApiResponse>(
            `${this.apiUrl}/user-service/id/${userId}`
        ).pipe(
            map(response => ({
                id: response.id,
                firebaseId: response.firebaseId,
                status: response.status,
                createAt: response.createAt,
                updateAt: response.updateAt,
                role: null,
                name: null,
                email: null,
                cell: null
            }))
        );
    }


    override updateUserStatus(
        userId: string,
        request: UpdateUserStatusRequest
    ): Observable<ManagedUser> {

        const payload = {
            firebaseId:
                request.firebaseId,

            estado:
                request.status
        };


        return this.http.put<UserApiResponse>(
            `${this.apiUrl}/user-service/actualizar-usuario/${userId}`,
            payload
        ).pipe(
            map(response => ({
                id: response.id,
                firebaseId: response.firebaseId,
                status: response.status,
                createAt: response.createAt,
                updateAt: response.updateAt,
                role: null,
                name: null,
                email: null,
                cell: null
            }))
        );
    }
}
