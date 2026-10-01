import {
    Observable
} from 'rxjs';

import {
    ClientProfile,
    UpdateProfileRequest
} from '../models/profile.model';

import {
    UserProfile
} from '../models/user-profile.model';


export abstract class ProfileRepository {

    abstract getProfile():
        Observable<UserProfile>;


    abstract updateProfile(
        clientId: string,
        request: UpdateProfileRequest
    ): Observable<ClientProfile>;
}