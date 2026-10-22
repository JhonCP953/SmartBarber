import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { OpenQueueUseCase } from '../../application/usecase/open-queue.use-case';
import { CloseQueueUseCase } from '../../application/usecase/close-queue.use-case';
import { GetQueueUseCase } from '../../application/usecase/get-queue.use-case';
import { NextCustomerUseCase } from '../../application/usecase/next-customer.use-case';
import { CompleteCurrentTurnUseCase } from '../../application/usecase/complete-current-turn.use-case';

import {
  QueueReservation,
  QueueSnapshotResponse
} from '../../domain/model/reservation-queue.model';

@Component({
  selector: 'app-virtual-queue',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './virtual-queue.component.html',
  styleUrl: './virtual-queue.component.css'
})
export class VirtualQueueComponent
  implements OnInit {

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

  readonly loading =
    signal(false);

  readonly actionLoading =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly snapshot =
    signal<QueueSnapshotResponse | null>(null);

  readonly currentTurn =
    signal<QueueReservation | null>(null);

  readonly waitingTurns =
    signal<QueueReservation[]>([]);

  readonly acceptingClients =
    signal(false);

  readonly waitingCount =
    signal(0);

  /**
   * TEMPORAL
   */
  readonly employeeId =
    '62b82354-95aa-4444-a2ae-54441973d590';

  ngOnInit(): void {
    this.loadQueue();
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

  openQueue(): void {

    this.actionLoading.set(true);

    this.openQueueUseCase
      .execute(this.employeeId)
      .subscribe({

        next: () => {

          this.actionLoading.set(false);

          this.loadQueue();
        },

        error: error => {

          console.error(
            'Error abriendo cola',
            error
          );

          this.actionLoading.set(false);
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

          this.loadQueue();
        },

        error: error => {

          console.error(
            'Error cerrando cola',
            error
          );

          this.actionLoading.set(false);
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

        error: error => {

          console.error(
            'Error completando turno',
            error
          );

          this.actionLoading.set(false);
        }
      });
  }
}