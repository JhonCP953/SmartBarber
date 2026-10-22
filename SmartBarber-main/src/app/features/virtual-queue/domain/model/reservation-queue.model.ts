/*
 * =====================================================
 * RESERVATION STATUS
 * =====================================================
 */

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

export interface QueueReservation {

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

}

/*
 * =====================================================
 * QUEUE SNAPSHOT
 * =====================================================
 */

export interface QueueSnapshotResponse {

  employeeId: string;

  acceptingClients: boolean;

  currentTurn:
    QueueReservation |
    null;

  waitingTurns:
    QueueReservation[];

  updatedAt: string;

}

/*
 * =====================================================
 * NEXT CUSTOMER
 * =====================================================
 */

export type NextCustomerResponse =
  QueueReservation;

/*
 * =====================================================
 * COMPLETE CURRENT TURN
 * =====================================================
 */

export type CompleteCurrentTurnResponse =
  QueueReservation;

/*
 * =====================================================
 * ERROR RESPONSE
 * =====================================================
 */

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