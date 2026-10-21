import {
    Observable
} from 'rxjs';

import {
    BackendAuthenticationResponse
} from '../models/auth-session.model';


export abstract class AuthRepository {

    abstract verifyAuthentication():
        Observable<BackendAuthenticationResponse>;

}