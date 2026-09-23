import { Observable } from 'rxjs';
import { AuthProfileResponse } from '../models/auth-session.model';

export abstract class AuthRepository {
    abstract getAuthenticatedProfile():
        Observable<AuthProfileResponse>;
}