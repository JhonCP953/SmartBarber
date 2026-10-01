import {
    Injectable,
    inject
} from '@angular/core';

import {
    Observable
} from 'rxjs';

import {
    ManagedUser
} from '../../domain/models/user-management.model';

import {
    UserManagementRepository
} from '../../domain/repositories/user-management.repository';


@Injectable()
export class GetUserUseCase {

    private readonly repository =
        inject(
            UserManagementRepository
        );


    execute(
        userId: string
    ): Observable<ManagedUser> {

        return this.repository
            .getUserById(
                userId
            );
    }
}