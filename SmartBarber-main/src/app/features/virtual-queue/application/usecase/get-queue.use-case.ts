import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {VirtualQueueRepository} from '../../domain/repository/virtualqueue.repository'
import {QueueSnapshotResponse} from '../../domain/model/reservation-queue.model'

@Injectable()
export class GetQueueUseCase {

  constructor(
    private repository: VirtualQueueRepository
  ) {}

  execute(employeeId: string):Observable<QueueSnapshotResponse> {
    return this.repository.getQueue(employeeId);
  }

}