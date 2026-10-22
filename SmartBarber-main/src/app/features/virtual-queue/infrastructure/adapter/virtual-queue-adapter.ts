import {
    Injectable,
    inject
} from '@angular/core';

import {
    HttpClient
} from '@angular/common/http';

import {VirtualQueueRepository} from '../../domain/repository/virtualqueue.repository'
import {OpenQueueResponse} from '../../domain/model/reservation-queue.model'
import {QueueSnapshotResponse} from '../../domain/model/reservation-queue.model'
import {CompleteCurrentTurnResponse} from '../../domain/model/reservation-queue.model'
import {NextCustomerResponse} from '../../domain/model/reservation-queue.model'
import {CloseQueueResponse} from '../../domain/model/reservation-queue.model'
import { environment } from '../../../../../environments/environment';

@Injectable()
export class VirtualQueueHttpAdapter
  implements VirtualQueueRepository {
  
    private readonly apiUrl = `${environment.apiUrl}/barber-service`;

  constructor(
    private http: HttpClient
  ) {}

  openQueue(employeeId: string) {
    return this.http.post<OpenQueueResponse>( 
      `${environment.apiUrl}/api/v1/queue/${employeeId}/open`,
      {}
    );
  }

  closeQueue(employeeId: string) {
    return this.http.post<CloseQueueResponse>(
      `${environment.apiUrl}/api/v1/queue/${employeeId}/close`,
      {}
    );
  }

  nextCustomer(employeeId: string) {
    return this.http.post<NextCustomerResponse>(
      `${environment.apiUrl}/api/v1/queue/${employeeId}/next`,
      {}
    );
  }

  completeCurrentTurn(employeeId: string) {
    return this.http.post<CompleteCurrentTurnResponse>(
      `${environment.apiUrl}/api/v1/queue/${employeeId}/complete`,
      {}
    );
  }

  getQueue(employeeId: string) {
    return this.http.get<QueueSnapshotResponse>(
      `${environment.apiUrl}/api/v1/queue/${employeeId}`
    );
  }

}