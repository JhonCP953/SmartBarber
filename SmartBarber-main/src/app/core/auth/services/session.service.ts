import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthSession } from '../model/auth-session.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly storageKey = 'smartbarber.session';

  private readonly sessionSubject =
    new BehaviorSubject<AuthSession | null>(this.loadStoredSession());

  readonly session$ = this.sessionSubject.asObservable();

  get currentSession(): AuthSession | null {
    return this.sessionSubject.value;
  }

  setSession(session: AuthSession): void {
    this.sessionSubject.next(session);

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(session));
    } catch {
      // El almacenamiento puede estar deshabilitado.
    }
  }

  updateSession(patch: Partial<AuthSession>): void {
    const current = this.currentSession;

    if (!current) {
      return;
    }

    this.setSession({
      ...current,
      ...patch
    });
  }

  getBarbershopId(): string | null {
    return this.currentSession?.barbershopId ?? null;
  }

  getTenantId(): string | null {
    return this.currentSession?.tenantId ?? null;
  }

  getUserId(): string | null {
    return this.currentSession?.userId ?? null;
  }

  getClientId(): string | null {
    return this.currentSession?.clientId ?? null;
  }

  getBarberId(): string | null {
    return this.currentSession?.barberId ?? null;
  }

  isAuthenticated(): boolean {
    return this.currentSession !== null;
  }

  isActive(): boolean {
    return this.currentSession?.status === 'ACTIVE';
  }

  hasRole(role: string): boolean {
    return this.currentSession?.role === role;
  }

  clearSession(): void {
    this.sessionSubject.next(null);

    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // El almacenamiento puede estar deshabilitado.
    }
  }

  private loadStoredSession(): AuthSession | null {
    try {
      const stored = localStorage.getItem(this.storageKey);

      if (!stored) {
        return null;
      }

      const session = JSON.parse(stored) as AuthSession;

      return {
        ...session,
        barbershopId: session.barbershopId ?? null,
        barbershopName: session.barbershopName ?? null,
        subscriptionStatus: session.subscriptionStatus ?? null,
        tenantId: session.tenantId ?? session.barbershopId ?? null,
        barberId: session.barberId ?? null,
        clientId: session.clientId ?? null
      };
    } catch {
      return null;
    }
  }
}