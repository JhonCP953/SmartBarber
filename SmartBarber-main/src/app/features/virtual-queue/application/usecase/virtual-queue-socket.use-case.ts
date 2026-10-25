import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { QueueEvent } from '../../domain/model/queue-event.model';
import { EventQueueRepository } from '../../domain/repository/event-queue.repository';

@Injectable({
  providedIn: 'root'
})
export class VirtualQueueWebSocketUseCase extends EventQueueRepository {

  private socket?: WebSocket;

  override connectWebsocket(
    employeeId: string
  ): Observable<QueueEvent> {

    return new Observable<QueueEvent>(observer => {

      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.close();
      }

      const wsUrl = environment.apiUrl
        .replace(/^http:/, 'ws:')
        .replace(/^https:/, 'wss:')
        .replace(/\/$/, '');

      this.socket = new WebSocket(
        `${wsUrl}/ws/virtual-queue?employeeId=${encodeURIComponent(employeeId)}`
      );

      this.socket.onopen = () => {
        console.log(
          '[VirtualQueueWS] Conectado para empleado:',
          employeeId
        );
      };

      this.socket.onmessage = event => {

        try {

          const response = JSON.parse(
            event.data
          ) as QueueEvent;

          if (!response?.type) {
            return;
          }

          observer.next(response);

        } catch (error) {

          console.error(
            '[VirtualQueueWS] Error procesando mensaje',
            error
          );
        }
      };

      /*this.socket.onerror = error => {

        console.error(
          '[VirtualQueueWS] Error de conexión',
          error
        );

        observer.error(error);
      };

      this.socket.onclose = event => {

        console.log(
          '[VirtualQueueWS] Conexión cerrada',
          event.code,
          event.reason
        );

        observer.complete();
      };

      return () => {

        if (
          this.socket &&
          (
            this.socket.readyState === WebSocket.OPEN ||
            this.socket.readyState === WebSocket.CONNECTING
          )
        ) {
          this.socket.close();
        }

        this.socket = undefined;
      };*/
    });
  }

  disconnect(): void {

    if (
      this.socket &&
      (
        this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING
      )
    ) {
      this.socket.close();
    }

    this.socket = undefined;
  }
}