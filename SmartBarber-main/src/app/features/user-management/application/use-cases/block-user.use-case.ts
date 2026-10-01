import {
    Injectable,
    inject
} from '@angular/core';

import {
    Observable,
    throwError
} from 'rxjs';

import {
    ManagedUser,
    UpdateUserStatusRequest
} from '../../domain/models/user-management.model';

import {
    UserManagementRepository
} from '../../domain/repositories/user-management.repository';

import {
    SessionService
} from '../../../../core/auth/services/session.service';


@Injectable()
export class BlockUserUseCase {

    private readonly repository =
        inject(
            UserManagementRepository
        );


    private readonly sessionService =
        inject(
            SessionService
        );


    execute(
        user: ManagedUser,
        reason: string
    ): Observable<ManagedUser> {


        const session =
            this.sessionService.currentSession;


        if (!session) {

            return throwError(
                () => new Error(
                    'SESSION_NOT_FOUND'
                )
            );
        }


        if (
            session.role !== 'ADMIN'
        ) {

            return throwError(
                () => new Error(
                    'UNAUTHORIZED_ROLE'
                )
            );
        }


        if (
            !user.id
        ) {

            return throwError(
                () => new Error(
                    'USER_ID_REQUIRED'
                )
            );
        }


        if (
            user.status === 'BLOCKED'
        ) {

            return throwError(
                () => new Error(
                    'USER_ALREADY_BLOCKED'
                )
            );
        }


        const normalizedReason =
            reason.trim();


        if (
            normalizedReason.length < 5
        ) {

            return throwError(
                () => new Error(
                    'BLOCK_REASON_REQUIRED'
                )
            );
        }


        const request:
            UpdateUserStatusRequest = {

            firebaseId:
                user.firebaseId,

            status:
                'Bloqueado',

            reason:
                normalizedReason
        };


        return this.repository
            .updateUserStatus(
                user.id,
                request
            );
    }
}