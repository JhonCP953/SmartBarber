import {
    Injectable
} from '@angular/core';

import {
    BehaviorSubject
} from 'rxjs';

import {
    AuthSession
} from '../model/auth-session.model';

@Injectable({
    providedIn: 'root'
})
export class SessionService {

    private readonly sessionSubject =
        new BehaviorSubject<AuthSession | null>(
            null
        );

    readonly session$ =
        this.sessionSubject.asObservable();


    get currentSession(): AuthSession | null {

        return this.sessionSubject.value;
    }


    setSession(
        session: AuthSession
    ): void {

        this.sessionSubject.next(
            session
        );
    }


    clearSession(): void {

        this.sessionSubject.next(
            null
        );
    }


    isAuthenticated(): boolean {

        return (
            this.currentSession !== null
        );
    }


    isActive(): boolean {

        return (
            this.currentSession?.status ===
            'ACTIVE'
        );
    }


    hasRole(
        role: string
    ): boolean {

        return (
            this.currentSession?.role ===
            role
        );
    }


    getUserId(): string | null {

        return (
            this.currentSession?.userId ??
            null
        );
    }


    getClientId(): string | null {

        return (
            this.currentSession?.clientId ??
            null
        );
    }


    getBarberId(): string | null {

        return (
            this.currentSession?.barberId ??
            null
        );
    }


    getBarbershopId(): string | null {

        return (
            this.currentSession?.barbershopId ??
            null
        );
    }
}