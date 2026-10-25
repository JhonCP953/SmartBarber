import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { OpenQueueUseCase } from '../../application/usecase/open-queue.use-case';
import { CloseQueueUseCase } from '../../application/usecase/close-queue.use-case';
import { GetQueueUseCase } from '../../application/usecase/get-queue.use-case';
import { NextCustomerUseCase } from '../../application/usecase/next-customer.use-case';
import { GetStatusQueueUseCase } from '../../application/usecase/get-status-queue.use-case';
import { CompleteCurrentTurnUseCase } from '../../application/usecase/complete-current-turn.use-case';
import { VirtualQueueWebSocketUseCase } from '../../application/usecase/virtual-queue-socket.use-case';

import { SessionService } from '../../../../core/auth/services/session.service';

import {
  QueueSnapshotResponse,
  //QueueReservation,
  QueueStatus,
  QueueErrorResponse,
} from '../../domain/model/reservation-queue.model';
import { QueueSnapshotResponseEvent, QueueTurn } from '../../domain/model/queue-event.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-virtual-queue',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './virtual-queue.component.html',
  styleUrl: './virtual-queue.component.css'
})
export class VirtualQueueComponent implements OnInit {

  private readonly session =
    inject(SessionService);

  private readonly openQueueUseCase =
    inject(OpenQueueUseCase);

  private readonly closeQueueUseCase =
    inject(CloseQueueUseCase);

  private readonly getQueueUseCase =
    inject(GetQueueUseCase);

  private readonly nextCustomerUseCase =
    inject(NextCustomerUseCase);

  private readonly completeCurrentTurnUseCase =
    inject(CompleteCurrentTurnUseCase);

  private readonly getStatusQueue =
    inject(GetStatusQueueUseCase);

  private readonly websocketEvents =
    inject(VirtualQueueWebSocketUseCase);

  readonly loading =
    signal(false);

  readonly actionLoading =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly snapshot =
    signal<QueueSnapshotResponse | QueueSnapshotResponseEvent | null>(null);

  readonly currentTurn =
    signal</*QueueReservation | */QueueTurn  | null>(null);

  readonly waitingTurns =
    signal</*QueueReservation | QueueReservation []*/ QueueTurn[]>([]);

  readonly statusQueue =
    signal<QueueStatus | null>(null);

  readonly payload =
    signal<QueueSnapshotResponse | null>(null);

  readonly acceptingClients =
    signal(false);

  readonly waitingCount =
    signal(0);

  readonly queueClosed = computed(
    () => !!this.snapshot() && !this.acceptingClients()
  );

  private get employeeId(): string {

    const barberId =
      this.session.getBarberId();

    if (!barberId) {
      throw new Error(
        'No existe un barbero autenticado.'
      );
    }

    return barberId;
  }

  ngOnInit(): void {
    this.consultStatusQueue();
  }

  loadQueue(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.getQueueUseCase
      .execute(this.employeeId)
      .subscribe({

        next: response => {

          this.snapshot.set(response);

          this.acceptingClients.set(
            response.acceptingClients
          );

          this.currentTurn.set(
            response.currentTurn
          );

          this.waitingTurns.set(
            response.waitingTurns
          );

          this.waitingCount.set(
            response.waitingTurns.length
          );

          this.loading.set(false);
        },

        error: error => {

          console.error(
            'Error consultando cola',
            error
          );

          this.errorMessage.set(
            'No fue posible consultar la cola.'
          );

          this.loading.set(false);
        }
      });
  }

  consultStatusQueue(): void {
    this.loading.set(true)

    this.getStatusQueue.execute(this.employeeId)
      .subscribe({
        next: response => {
          this.loading.set(false),
            this.statusQueue.set(response)
          this.acceptingClients.set(response.acceptingClients)
          if (response.acceptingClients) {
            this.loadQueue();
            this.connectWebsocketEvent()
          }
        },
        error: (error: HttpErrorResponse) => {

          this.loading.set(false);
          this.acceptingClients.set(false)
          const response: QueueErrorResponse =
            error.error;

          console.error(
            'Error en el proceso de consulta de cola',
            response
          );

          this.errorMessage.set(
            response.message
          );
        }
      });

  }

  openQueue(): void {

    this.actionLoading.set(true);

    this.openQueueUseCase
      .execute(this.employeeId)
      .subscribe({
        next: () => {

          this.actionLoading.set(false);
          this.loadQueue();
          this.connectWebsocketEvent()
        },
        error: (error: HttpErrorResponse) => {

          this.loading.set(false);
          this.acceptingClients.set(false)
          const response: QueueErrorResponse =
            error.error;

          console.error(
            'Error en el proceso de consulta de cola',
            response
          );

          this.errorMessage.set(
            response.message
          );
        }
      });
  }

  closeQueue(): void {

    this.actionLoading.set(true);

    this.closeQueueUseCase
      .execute(this.employeeId)
      .subscribe({

        next: () => {
          this.actionLoading.set(false);
          this.consultStatusQueue();
        },

        error: (error: HttpErrorResponse) => {

          this.loading.set(false);
          this.acceptingClients.set(false)
          const response: QueueErrorResponse =
            error.error;

          console.error(
            'Error en el proceso de consulta de cola',
            response
          );

          this.errorMessage.set(
            response.message
          );
        }
      });
  }

  nextCustomer(): void {

    this.actionLoading.set(true);

    this.nextCustomerUseCase
      .execute(this.employeeId)
      .subscribe({

        next: () => {

          this.actionLoading.set(false);
          this.loadQueue();
        },

        error: error => {

          console.error(
            'Error llamando siguiente turno',
            error
          );

          this.actionLoading.set(false);
        }
      });
  }

  completeTurn(): void {

    this.actionLoading.set(true);

    this.completeCurrentTurnUseCase
      .execute(this.employeeId)
      .subscribe({

        next: () => {

          this.actionLoading.set(false);
          this.loadQueue();
        },

        error: (error: HttpErrorResponse) => {

          this.loading.set(false);
          this.acceptingClients.set(false)
          const response: QueueErrorResponse =
            error.error;

          console.error(
            'Error en el proceso de consulta de cola',
            response
          );

          this.errorMessage.set(
            response.message
          );
        }
      });
  }

  connectWebsocketEvent(): void {

    this.websocketEvents
      .connectWebsocket(this.employeeId)
      .subscribe({
      
        next: event => {

          console.log(
            '[QUEUE EVENT]',
            event.type,
            event
          );

          switch (event.type) {

            case 'QUEUE_SNAPSHOT':

              this.snapshot.set(event.payload);

              this.acceptingClients.set(
                event.payload.acceptingClients
              );

              this.currentTurn.set(
                event.payload.currentTurn
              );

              this.waitingTurns.set(
                event.payload.waitingTurns
              );

              this.waitingCount.set(
                event.payload.waitingTurns.length
              );

              break;

            case 'QUEUE_NEXT_CUSTOMER':

              this.snapshot.set(event.payload);

              this.acceptingClients.set(
                event.payload.acceptingClients
              );

              this.currentTurn.set(
                event.payload.currentTurn
              );

              this.waitingTurns.set(
                event.payload.waitingTurns
              );

              this.waitingCount.set(
                event.payload.waitingTurns.length
              );

              break;

            case 'QUEUE_COMPLETED_CURRENT_TURN':

              this.snapshot.set(event.payload);

              this.acceptingClients.set(
                event.payload.acceptingClients
              );

              this.currentTurn.set(
                event.payload.currentTurn
              );

              this.waitingTurns.set(
                event.payload.waitingTurns
              );

              this.waitingCount.set(
                event.payload.waitingTurns.length
              );

              break;

            default:

              console.warn(
                'Evento no manejado:',
                event.type
              );
          }
        },

        error: error => {

          console.error(
            'Error WebSocket:',
            error
          );
        },

        /*complete: () => {

          console.log(
            'Conexión WebSocket cerrada'
          );
        }*/
      });
  }
}