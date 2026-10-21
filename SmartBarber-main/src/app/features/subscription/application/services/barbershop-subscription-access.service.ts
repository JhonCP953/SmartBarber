import { Injectable, inject, signal } from '@angular/core';

import {
  SubscriptionApiService,
  SubscriptionStatusContractUnavailableError
} from '../../infrastructure/api/subscription-api.service';

export type SubscriptionAccessStatus =
  | 'loading'
  | 'active'
  | 'approved'
  | 'inactive'
  | 'pending'
  | 'expired'
  | 'declined'
  | 'error'
  | 'unavailable';

export interface SubscriptionAccessState {
  status: SubscriptionAccessStatus;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BarbershopSubscriptionAccessService {
  private readonly subscriptionApi = inject(SubscriptionApiService);

  readonly state = signal<SubscriptionAccessState>({
    status: 'unavailable',
    message: 'La consulta de suscripción está pendiente de conectar con un contrato confirmado del backend.'
  });

  get restrictsModules(): boolean {
    return [
      'inactive',
      'approved',
      'pending',
      'expired',
      'declined'
    ].includes(this.state().status);
  }

  refresh(): void {
    this.setLoading();

    this.subscriptionApi.getCurrentSubscription().subscribe({
      next: () => {
        this.setError(
          'El formato actual de suscripción no permite confirmar el estado activo y vigente. Se requiere el contrato específico de consulta de la barbería.'
        );
      },
      error: (error: unknown) => {
        if (error instanceof SubscriptionStatusContractUnavailableError) {
          this.state.set({
            status: 'unavailable',
            message: error.message
          });
          return;
        }

        this.setError(
          error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado al consultar la suscripción.'
        );
      }
    });
  }

  setVerifiedStatus(
    status: Exclude<SubscriptionAccessStatus, 'loading' | 'error' | 'unavailable'>
  ): void {
    this.state.set({ status });
  }

  setLoading(): void {
    this.state.set({ status: 'loading' });
  }

  setError(message: string): void {
    this.state.set({ status: 'error', message });
  }
}
