import { Observable } from 'rxjs';

import {
    BackendRole
} from '../models/auth-session.model';

export abstract class AuthRepository {

    abstract verifyAuthentication():
        Observable<BackendRole>;
}