import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VirtualQueueRepository } from '../../domain/repository/virtualqueue.repository';
import {OpenQueueResponse} from '../../domain/model/reservation-queue.model'

@Injectable()
export class OpenQueueUseCase {

  constructor(
    private repository: VirtualQueueRepository
  ) {}

  execute(employeeId: string):Observable<OpenQueueResponse> {
    return this.repository.openQueue(employeeId);
  }

}