import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionWsService {
  private socket$!: WebSocket;
  private messageSubject = new Subject<any>();

  private wsUrl = 'ws://localhost:8080/ws/subscriptions';

  constructor() {
    this.connect();
  }

  public connect(): void {
    this.socket$ = new WebSocket(this.wsUrl);

    this.socket$.onopen = (event) => {
      console.log('Conectado al WebSocket de suscripciones', event);
    };

    this.socket$.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messageSubject.next(data);
    };

    this.socket$.onerror = (error) => {
      console.error('Error en WebSocket:', error);
    };

    this.socket$.onclose = (event) => {
      console.warn('Conexión WebSocket cerrada. Reconectando...', event);
      setTimeout(() => this.connect(), 3000); // Auto-reconexión
    };
  }

  // Enviar datos de la suscripción al backend por el socket
  public sendSubscription(data: any): void {
    if (this.socket$.readyState === WebSocket.OPEN) {
      this.socket$.send(JSON.stringify(data));
    } else {
      console.error('El WebSocket no está abierto. Estado:', this.socket$.readyState);
    }
  }

  // Escuchar respuestas del backend
  public getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }
}