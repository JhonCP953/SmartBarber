/*
 * =====================================================
 * RESERVATION STATUS
 * =====================================================
 */

import { exp } from 'firebase/firestore/pipelines';
import {ServiceReservation} from './service-reservation.model'
import {QueueTurn} from './queue-event.model'

export type ReservationStatus =
  'WAITING' |
  'IN_PROGRESS' |
  'COMPLETED';

/*
 * =====================================================
 * OPEN QUEUE
 * =====================================================
 */

export interface OpenQueueResponse {

  employeeId: string;

  message: string;

}

/*
 * =====================================================
 * CLOSE QUEUE
 * =====================================================
 */

export interface CloseQueueResponse {

  employeeId: string;

  message: string;

}

/*
 * =====================================================
 * QUEUE RESERVATION
 * =====================================================
 */

/*export interface QueueReservation {

  id: string;

  barbershopId: string;

  customerId: string;

  employeeId: string;

  reservationType: string;

  status: ReservationStatus;

  duration: number;

  notes: string | null;

  queueEntryTime: string;

  startTime: string | null;

  endTime: string | null;

  creationDate: string;

  updatedDate: string | null;

}*/

/*
 * =====================================================
 * QUEUE SNAPSHOT
 * =====================================================
 */

export interface QueueSnapshotResponse {

  employeeId: string;

  acceptingClients: boolean;

  currentTurn:
    QueueTurn |
    null;

  waitingTurns:
    QueueTurn[];

  updatedAt: string;

}

export interface JoinQueueResonse {
  creationDate: string;
  customer: Customer;
  duration: number;
  employeeId: string;
  endTime: string | null;
  id: string | null;
  notes: string;
  queueEntryTime: string;
  reservationType: string;
  serviceReservations: ServiceReservation[];
  startTime: string | null;
  status: string;
  updatedDate: string | null;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
}

/*
 * =====================================================
 * NEXT CUSTOMER
 * =====================================================
 */

export type NextCustomerResponse =
  //QueueReservation;
  QueueTurn
/*
 * =====================================================
 * COMPLETE CURRENT TURN
 * =====================================================
 */

export type CompleteCurrentTurnResponse =
  //QueueReservation;
  QueueTurn

/*
 * =====================================================
 * ERROR RESPONSE
 * =====================================================
 */

export interface JoinQueueRequest{
	customerId: string,
	barbershopId: string,
	employeeId: string,
	reservationServiceId: [number],
	notes: string
}

export interface QueueErrorResponse {

  reason: string;

  code: string;

  message: string;

  date: string;

}

export interface QueueErrorWrapper {

  data: QueueErrorResponse;

}
 
export interface QueueWebSocketMessage {

  type:
    'QUEUE_OPENED' |
    'QUEUE_SNAPSHOT' |
    'QUEUE_UPDATED';

  payload:
    QueueSnapshotResponse;

}

export interface QueueStatus {
  id: string,
  employeeId: string,
	barbershopId: string,
	acceptingClients: boolean,
	version: number,
	creationDate: string,
	updatedDate: string
}
/*
 * =====================================================
 * TYPE GUARD
 * =====================================================
 */

export function isQueueErrorResponse(
  response: unknown
): response is QueueErrorWrapper {

  if (
    response === null ||
    typeof response !== 'object'
  ) {
    return false;
  }

  const responseObject =
    response as Record<string, unknown>;

  const data =
    responseObject['data'];

  if (
    data === null ||
    typeof data !== 'object'
  ) {
    return false;
  }

  const error =
    data as Record<string, unknown>;

  return (
    typeof error['reason'] === 'string' &&
    typeof error['code'] === 'string' &&
    typeof error['message'] === 'string' &&
    typeof error['date'] === 'string'
  );

}