import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BarberServicePayload } from '../components/crud-service/Create-service/crud-servicios.component'; // O ajusta la ruta de tu interfaz

@Injectable({
  providedIn: 'root'
})
export class BarberServiceService {
  private apiUrl = 'http://localhost:8080/services-service';

  constructor(private http: HttpClient) {}

  createService(payload: BarberServicePayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear-servicio`, payload);
  }

  // más endpoints para listar, actualizar o desactivar, los puedes agregar aquí

 getAllServices(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  getServiceById(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/id/${id}`);
  }
}