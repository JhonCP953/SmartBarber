import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  VirtualQueueRepository
} from '../../domain/repository/virtualqueue.repository';

import {
  QueueEvent
} from '../../domain/model/queue-event.model';

@Injectable({
  providedIn: 'root'
})
export class VirtualQueueWebSocketUseCAse
  extends VirtualQueueRepository {

  private socket?: WebSocket;

  connect(
    employeeId: string
  ): Observable<QueueEvent> {

    return new Observable(observer => {

      this.socket = new WebSocket(
        `ws://localhost:8080ws/virtual-queue?employeeId=${employeeId}`
      );

      this.socket.onmessage = event => {

        const response =
          JSON.parse(event.data) as QueueEvent;

        observer.next(response);
      };

      this.socket.onerror = error => {
        observer.error(error);
      };

      this.socket.onclose = () => {
        observer.complete();
      };

      return () => {
        this.socket?.close();
      };
    });
  }

  disconnect(): void {
    this.socket?.close();
  }
}