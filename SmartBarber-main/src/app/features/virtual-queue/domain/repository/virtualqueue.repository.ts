import {
    Observable
} from 'rxjs';

import {OpenQueueResponse} from '../../domain/model/reservation-queue.model'
import {QueueSnapshotResponse} from '../../domain/model/reservation-queue.model'
import {CompleteCurrentTurnResponse} from '../../domain/model/reservation-queue.model'
import {NextCustomerResponse} from '../../domain/model/reservation-queue.model'
import {CloseQueueResponse} from '../../domain/model/reservation-queue.model'
import {QueueStatus} from '../../domain/model/reservation-queue.model'
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})

export abstract class VirtualQueueRepository {

  abstract openQueue(
    employeeId: string
  ): Observable<OpenQueueResponse>;

  abstract closeQueue(
    employeeId: string
  ): Observable<CloseQueueResponse>;

  abstract nextCustomer(
    employeeId: string
  ): Observable<NextCustomerResponse>;

  abstract completeCurrentTurn(
    employeeId: string
  ): Observable<CompleteCurrentTurnResponse>;

  abstract getQueue(
    employeeId: string
  ): Observable<QueueSnapshotResponse>;

  abstract statusQuee(   
    employeeId: string
  ): Observable<QueueStatus>;
}