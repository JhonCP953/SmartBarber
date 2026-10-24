import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {VirtualQueueRepository} from '../../domain/repository/virtualqueue.repository'
import {QueueStatus} from '../../domain/model/reservation-queue.model'

@Injectable()
export class GetStatusQueueUseCase {

  constructor(
    private repository: VirtualQueueRepository
  ) {}

  execute(employeeId: string):Observable<QueueStatus> {
    return this.repository.statusQuee(employeeId);
  }

}