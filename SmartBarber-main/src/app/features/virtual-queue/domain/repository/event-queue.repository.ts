import { Observable } from "rxjs";
import {QueueEvent} from '../model/queue-event.model'

export abstract class EventQueueRepository {
    abstract connectWebsocket(employeeId: string):Observable<QueueEvent>
}