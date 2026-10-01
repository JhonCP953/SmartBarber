import {
    Injectable,
    inject
} from '@angular/core';

import {
    Observable
} from 'rxjs';

import {
    ProfileRepository
} from '../../domain/repositories/profile.repository';

import {
    UserProfile
} from '../../domain/models/user-profile.model';


@Injectable()
export class GetProfileUseCase {

    private readonly repository =
        inject(ProfileRepository);


    execute():
        Observable<UserProfile> {

        return this.repository.getProfile();
    }
}