import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { getAuth } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): Observable<HttpHeaders> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      return from(user.getIdToken(true)).pipe(
        switchMap(token => {
          const cleanToken = token.replace(/['"]+/g, '').trim();
          return new Observable<HttpHeaders>(subscriber => {
            subscriber.next(new HttpHeaders({
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${cleanToken}`
            }));
            subscriber.complete();
          });
        }),
        catchError(err => throwError(() => err))
      );
    }

    const token = (
      localStorage.getItem('token') || 
      localStorage.getItem('smartbarber.token') || 
      localStorage.getItem('firebaseToken') || ''
    ).replace(/['"]+/g, '').trim();

    return new Observable(subscriber => {
      subscriber.next(new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }));
      subscriber.complete();
    });
  }

  getBarberias(): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.get(`${this.apiUrl}/barber-service/find-all`, { headers }))
    );
  }

getEmployeesByBarberiaId(barberiaId: string): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.get(`${this.apiUrl}/public/employee-service/barbershop/${barberiaId}`, { headers }))
    );
  }

  getServicesByBarberiaId(barberiaId: string): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.get(`${this.apiUrl}/services-service/barberia/${barberiaId}`, { headers }))
    );
  }

  getScheduleByEmployeeId(employeeId: string): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.get(`${this.apiUrl}/schedule-service/id/${employeeId}`, { headers }))
    );
  }
  getScheduleById(scheduleId: number | string): Observable<any> {
  return this.getAuthHeaders().pipe(
    switchMap(headers => this.http.get(`${this.apiUrl}/schedule-service/id/${scheduleId}`, { headers }))
  );
}

  createReservation(payload: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.post(`${this.apiUrl}/reservation-service/create`, payload, { headers }))
    );
  }
}