import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

export interface SubscriptionPayload {
  fullName: string;
  email: string;
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  autoRenew: boolean;
  planName: string;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = 'http://localhost:8080/subscription-barbershop-service/create';
  private wsUrl = 'ws://localhost:8080/ws/payment';
  
  private socket$!: WebSocket;
  private paymentStatusSubject = new Subject<any>();

  constructor(private readonly http: HttpClient) {}

  createSubscription(payload: SubscriptionPayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  connectWebSocket(): void {
    this.socket$ = new WebSocket(this.wsUrl);

    this.socket$.onopen = () => {
      console.log('🟢 Conectado al WebSocket de pagos: ws://localhost:8080/ws/payment');
    };

    this.socket$.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.paymentStatusSubject.next(data);
      } catch (e) {
        this.paymentStatusSubject.next(event.data);
      }
    };

    this.socket$.onerror = (error) => {
      console.error('❌ Error en WebSocket:', error);
    };

    this.socket$.onclose = () => {
      console.warn('⚠️ WebSocket desconectado');
    };
  }

  getPaymentStatus(): Observable<any> {
    return this.paymentStatusSubject.asObservable();
  }

  disconnectWebSocket(): void {
    if (this.socket$) {
      this.socket$.close();
    }
  }
}