import { Routes } from '@angular/router';
 
import { VirtualQueueRepository } from './domain/repository/virtualqueue.repository';
import { VirtualQueueHttpAdapter } from './infrastructure/adapter/virtual-queue-adapter';
 
import { OpenQueueUseCase } from './application/usecase/open-queue.use-case';
import { CloseQueueUseCase } from './application/usecase/close-queue.use-case';
import { GetQueueUseCase } from './application/usecase/get-queue.use-case';
import { NextCustomerUseCase } from './application/usecase/next-customer.use-case';
import { CompleteCurrentTurnUseCase } from './application/usecase/complete-current-turn.use-case';
import { GetStatusQueueUseCase } from './application/usecase/get-status-queue.use-case';
import {VirtualQueueWebSocketUseCase} from './application/usecase/virtual-queue-socket.use-case';

export const VIRTUAL_QUEUE_ROUTES: Routes = [
  {
    path: '',
    providers: [
      {
        provide: VirtualQueueRepository,
        useClass: VirtualQueueHttpAdapter
      },
      OpenQueueUseCase,
      CloseQueueUseCase,
      GetQueueUseCase,
      NextCustomerUseCase,
      CompleteCurrentTurnUseCase,
      GetStatusQueueUseCase,
      VirtualQueueWebSocketUseCase
    ],
    loadComponent: () =>
      import('./presentation/pages/virtual-quee.component')
        .then(m => m.VirtualQueueComponent)
  }
];