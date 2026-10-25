import {
    Injectable,
    inject
} from '@angular/core';

import { EventQueueRepository } from "../../domain/repository/event-queue.repository";
import { Observable } from "rxjs";
import { QueueEvent } from "../../domain/model/queue-event.model";
import { environment } from '../../../../../environments/environment';

export class WebsocketEventsQueueAdapter
    extends EventQueueRepository {

    private readonly apiUrl = `${environment.apiUrl}/barber-service`;

    override connectWebsocket(employeeId: string): Observable<QueueEvent> {
        return new Observable<QueueEvent>(observer => {

            const baseUrl = environment.apiUrl
                .replace(/^http:/, 'ws:')
                .replace(/^https:/, 'wss:')
                .replace(/\/$/, '');

            const url =
                `${baseUrl}/ws/virtual-queue` +
                `?employeeId=${encodeURIComponent(employeeId)}`;

            const socket = new WebSocket(url);

            socket.onopen = () => {
                console.log('WebSocket conectado');
            };

            socket.onmessage = event => {
                try {
                    const message = JSON.parse(event.data) as QueueEvent;

                    if (
                        message.type === 'QUEUE_NEXT_CUSTOMER' ||
                        message.type === 'QUEUE_SNAPSHOT' ||
                        message.type === 'QUEUE_COMPLETED_CURRENT_TURN'
                    ) {
                        observer.next(message);
                    }
                } catch (error) {
                    console.error(
                        'Mensaje WebSocket de cola inválido:',
                        error
                    );
                }
            };

            socket.onerror = error => {
                observer.error(error);
            };

            socket.onclose = () => {
                observer.complete();
            };

            return () => {
                socket.close();
            };
        });
    }
}