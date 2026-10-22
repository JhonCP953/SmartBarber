import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {VirtualQueueRepository} from '../../domain/repository/virtualqueue.repository'


@Injectable()
export class CompleteCurrentTurnUseCase {

  constructor(
    private repository: VirtualQueueRepository
  ) {}

  execute(employeeId: string) {
    return this.repository.completeCurrentTurn(employeeId);
  }

}