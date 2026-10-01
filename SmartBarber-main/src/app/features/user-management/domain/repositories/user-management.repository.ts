import {
    Observable
} from 'rxjs';

import {
    ManagedUser,
    UpdateUserStatusRequest
} from '../models/user-management.model';


export abstract class UserManagementRepository {

    abstract getUserById(
        userId: string
    ): Observable<ManagedUser>;


    abstract updateUserStatus(
        userId: string,
        request: UpdateUserStatusRequest
    ): Observable<ManagedUser>;
}