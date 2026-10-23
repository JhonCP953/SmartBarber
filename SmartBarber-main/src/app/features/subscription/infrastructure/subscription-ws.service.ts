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
  // Optional UI-only values; toRequest deliberately excludes them from HTTP.
  fullName?: string | null;
  email?: string | null;
  cardNumber?: string | null;
  expirationDate?: string | null;
  cvv?: string | null;
  autoRenew?: boolean;
  planName?: string;
  price?: number;
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
export class SubscriptionService {
  private readonly createUrl =
    `${environment.apiUrl}/subscription-barbershop-service/create`;
  private readonly renewUrl =
    `${environment.apiUrl}/subscription-barbershop-service/renew`;
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
    const barbershopId = this.getAuthenticatedBarbershopId();

    return this.http.post<SubscriptionCreationResponse>(
      this.createUrl,
      this.toRequest(payload, barbershopId, 'CREATE')
    );
  }

  renewSubscription(
    payload: SubscriptionPayload
  ): Observable<SubscriptionCreationResponse> {
    const barbershopId = this.getAuthenticatedBarbershopId();

    return this.http.put<SubscriptionCreationResponse>(
      this.renewUrl,
      this.toRequest(payload, barbershopId, 'RENEW')
    );
  }

  getSubscriptionData(): Observable<never> {
    return throwError(
      () => new Error(
        'La consulta de suscripción vigente no está disponible: el contrato de ese endpoint aún no está confirmado.'
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

    const socket = new WebSocket(paymentUrl);
    this.socket = socket;

    socket.onopen = () => {
      console.info('Conectado al WebSocket de pagos.');
    };

    socket.onmessage = event => {
      try {
        this.paymentStatusSubject.next(JSON.parse(event.data) as unknown);
      } catch (error: unknown) {
        console.warn('El evento de pago no contiene JSON válido:', error);
        this.paymentStatusSubject.next(event.data);
      }
    };

    socket.onerror = error => {
      console.error('Error en el WebSocket de pagos:', error);
    };

    socket.onclose = event => {
      if (this.socket === socket) {
        this.socket = null;
      }

      console.info(
        `WebSocket de pagos cerrado (código ${event.code}).`
      );
    };
  }

  getPaymentStatus(): Observable<unknown> {
    return this.paymentStatusSubject.asObservable();
  }

  disconnectWebSocket(): void {
    const socket = this.socket;
    this.socket = null;

    if (
      socket &&
      (
        socket.readyState === WebSocket.CONNECTING ||
        socket.readyState === WebSocket.OPEN
      )
    ) {
      socket.close();
    }
  }

  private toRequest(
    payload: SubscriptionPayload,
    barbershopId: string,
    type: SubscriptionType
  ): SubscriptionPayload & {
    barberId: string;
    status: SubscriptionBarberStatus;
    type: SubscriptionType;
  } {
    return {
      subscriptionId: payload.subscriptionId,
      duration: payload.duration,
      automaticRenew: payload.automaticRenew,
      barberId: barbershopId,
      status: 'PENDING',
      type
    };
  }

  private getAuthenticatedBarbershopId(): string {
    const session = this.sessionService.currentSession;

    if (
      session?.role !== 'ADMIN' ||
      !session.barbershopId
    ) {
      throw new Error(
        'No se encontró una barbería asociada al administrador autenticado.'
      );
    }

    return session.barbershopId;
  }
}

export { SubscriptionService as SubscriptionWsService };
