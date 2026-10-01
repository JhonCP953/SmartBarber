import {
    Injectable,
    inject
} from '@angular/core';

import {
    Observable,
    throwError
} from 'rxjs';

import {
    ProfileRepository
} from '../../domain/repositories/profile.repository';

import {
    ClientProfile,
    UpdateProfileRequest
} from '../../domain/models/profile.model';

import {
    SessionService
} from '../../../../core/auth/services/session.service';


@Injectable()
export class UpdateProfileUseCase {

    private readonly repository =
        inject(ProfileRepository);

    private readonly sessionService =
        inject(SessionService);


    execute(
        request: UpdateProfileRequest
    ): Observable<ClientProfile> {

        const session =
            this.sessionService.currentSession;


        if (!session) {

            return throwError(
                () =>
                    new Error(
                        'SESSION_NOT_FOUND'
                    )
            );
        }


        if (
            session.role !== 'CLIENT'
        ) {

            return throwError(
                () =>
                    new Error(
                        'PROFILE_EDIT_NOT_AVAILABLE'
                    )
            );
        }


        if (!session.clientId) {

            return throwError(
                () =>
                    new Error(
                        'CLIENT_PROFILE_NOT_FOUND'
                    )
            );
        }


        return this.repository.updateProfile(
            session.clientId,
            request
        );
    }
}