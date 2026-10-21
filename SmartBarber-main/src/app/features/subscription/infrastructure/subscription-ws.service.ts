import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';

import { SessionService } from '../../../core/auth/services/session.service';
import { environment } from '../../../../environments/environment';

export type SubscriptionType = 'CREATE' | 'RENEW';
export type SubscriptionBarberStatus =
  | 'ACTIVE'
  | 'APPROVED'
  | 'PENDING'
  | 'DECLINED'
  | 'EXPIRED';

export interface SubscriptionPayload {
  subscriptionId: number;
  duration: number;
  automaticRenew: boolean;
}

export interface SubscriptionCreationResponse {
  id: string;
  barberId: string;
  subscriptionId: number;
  status: SubscriptionBarberStatus;
  duration: number;
  subscriptionPrice: number;
  subscriptionDiscount: number;
  orderId: string;
  createdAt: string;
  updatedAt: string | null;
  startDate: string | null;
  expirationDate: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionWsService {
  private readonly createUrl =
    `${environment.apiUrl}/subscription-barbershop-service/create`;
  private readonly paymentStatusSubject =
    new Subject<unknown>();

  private socket: WebSocket | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly sessionService: SessionService
  ) {}

  createSubscription(
    payload: SubscriptionPayload
  ): Observable<SubscriptionCreationResponse> {
    const barberId = this.getAuthenticatedEmployeeId();

    return this.http.post<SubscriptionCreationResponse>(
      this.createUrl,
      {
        ...payload,
        barberId,
        status: 'PENDING' satisfies SubscriptionBarberStatus,
        type: 'CREATE' satisfies SubscriptionType
      }
    );
  }

  renewSubscription(
    payload: SubscriptionPayload
  ): Observable<SubscriptionCreationResponse> {
    const barberId = this.getAuthenticatedEmployeeId();

    return this.http.put<SubscriptionCreationResponse>(
      `${environment.apiUrl}/subscription-barbershop-service/renew`,
      {
        ...payload,
        barberId,
        status: 'PENDING' satisfies SubscriptionBarberStatus,
        type: 'RENEW' satisfies SubscriptionType
      }
    );
  }

  getSubscriptionData(): Observable<never> {
    return throwError(
      () => new Error(
        'El backend no expone una consulta para obtener la suscripción vigente de la barbería.'
      )
    );
  }

  connectWebSocket(orderId: string): void {
    this.disconnectWebSocket();

    if (!orderId.trim()) {
      throw new Error('El backend no devolvió un orderId válido para el pago.');
    }

    const apiUrl = new URL(environment.apiUrl);
    const protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    const paymentUrl =
      `${protocol}//${apiUrl.host}/ws/payment?orderId=${encodeURIComponent(orderId)}`;

    this.socket = new WebSocket(paymentUrl);

    this.socket.onmessage = event => {
      try {
        this.paymentStatusSubject.next(JSON.parse(event.data) as unknown);
      } catch (error: unknown) {
        console.error('No fue posible interpretar el evento de pago:', error);
        this.paymentStatusSubject.next(event.data);
      }
    };

    this.socket.onerror = error => {
      console.error('Error en el WebSocket de pagos:', error);
    };
  }

  getPaymentStatus(): Observable<unknown> {
    return this.paymentStatusSubject.asObservable();
  }

  disconnectWebSocket(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private getAuthenticatedEmployeeId(): string {
    const session = this.sessionService.currentSession;

    if (
      session?.role !== 'ADMIN' ||
      !session.barberId ||
      !session.barbershopId
    ) {
      throw new Error(
        'No se encontró un perfil de administrador asociado a una barbería.'
      );
    }

    return session.barberId;
  }
}

export { SubscriptionWsService as SubscriptionService };
