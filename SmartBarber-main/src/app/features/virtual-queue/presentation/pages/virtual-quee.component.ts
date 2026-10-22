import {
  Component,
  OnInit
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { RouterLink } from '@angular/router';

import {
  CommonModule
} from '@angular/common';

import {
  OpenQueueUseCase
} from '../../application/usecase/open-queue.use-case';

import {
  CloseQueueUseCase
} from '../../application/usecase/close-queue.use-case';

import {
  GetQueueUseCase
} from '../../application/usecase/get-queue.use-case';

import {
  NextCustomerUseCase
} from '../../application/usecase/next-customer.use-case';

import {
  CompleteCurrentTurnUseCase
} from '../../application/usecase/complete-current-turn.use-case';

import {
  QueueReservation,
  QueueSnapshotResponse
} from '../../domain/model/reservation-queue.model';

@Component({
  selector: 'app-virtual-queue',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl:
    './virtual-queue.component.html',
  styleUrl: './virtual-queue.component.css'
})
export class VirtualQueueComponent
  implements OnInit {

  loading: boolean = false;

  actionLoading: boolean = false;

  errorMessage: string = '';

  snapshot: QueueSnapshotResponse | null = null;

  currentTurn: QueueReservation | null = null;

  waitingTurns: QueueReservation[] = [];

  acceptingClients: boolean = false;

  waitingCount: number = 0;

  /**
   * TEMPORAL
   */
  employeeId: string =
    '62b82354-95aa-4444-a2ae-54441973d590';

  constructor(
    private openQueueUseCase:
      OpenQueueUseCase,

    private closeQueueUseCase:
      CloseQueueUseCase,

    private getQueueUseCase:
      GetQueueUseCase,

    private nextCustomerUseCase:
      NextCustomerUseCase,

    private completeCurrentTurnUseCase:
      CompleteCurrentTurnUseCase,

    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    this.loadQueue();

  }

  loadQueue(): void {

    this.loading = true;

    this.errorMessage = '';

    this.getQueueUseCase
      .execute(
        this.employeeId
      )
      .subscribe({

        next: (
          response
        ) => {

          this.snapshot =
            response;

          this.acceptingClients =
            response.acceptingClients;

          this.currentTurn =
            response.currentTurn;

          this.waitingTurns =
            response.waitingTurns;

          this.waitingCount =
            response.waitingTurns.length;

          this.loading =
            false;

        },

        error: (
          error
        ) => {

          console.error(
            'Error consultando cola',
            error
          );

          this.errorMessage =
            'No fue posible consultar la cola.';

          this.loading =
            false;

        }

      });

  }

  openQueue(): void {

    this.actionLoading = true;

    this.openQueueUseCase
      .execute(
        this.employeeId
      )
      .subscribe({

        next: () => {

          this.actionLoading =
            false;

          this.loadQueue();

        },

        error: (
          error
        ) => {

          console.error(
            'Error abriendo cola',
            error
          );

          this.actionLoading =
            false;

        }

      });

  }

  closeQueue(): void {

    this.actionLoading = true;

    this.closeQueueUseCase
      .execute(
        this.employeeId
      )
      .subscribe({

        next: () => {

          this.actionLoading =
            false;

          this.loadQueue();

        },

        error: (
          error
        ) => {

          console.error(
            'Error cerrando cola',
            error
          );

          this.actionLoading =
            false;

        }

      });

  }

  nextCustomer(): void {

    this.actionLoading = true;

    this.nextCustomerUseCase
      .execute(
        this.employeeId
      )
      .subscribe({

        next: () => {

          this.actionLoading =
            false;

          this.loadQueue();

        },

        error: (
          error
        ) => {

          console.error(
            'Error llamando siguiente turno',
            error
          );

          this.actionLoading =
            false;

        }

      });

  }

  completeTurn(): void {

    this.actionLoading = true;

    this.completeCurrentTurnUseCase
      .execute(
        this.employeeId
      )
      .subscribe({

        next: () => {

          this.actionLoading =
            false;

          this.loadQueue();

        },

        error: (
          error
        ) => {

          console.error(
            'Error completando turno',
            error
          );

          this.actionLoading =
            false;

        }

      });

  }

}