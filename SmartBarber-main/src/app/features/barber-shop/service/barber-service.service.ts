import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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


getServicesByBarberiaId(barberiaId: string): Observable<BarberServicePayload[]> {
    // Pega aquí directamente el token exacto que te funcionó en Insomnia para descartar si el localStorage falla al leer
    const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjkwNGIwZjkxYmU2ZWIwODY3ZGFiYmFhYjU4N2RmYzJlMzNmMDBhMjQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc21hcnRiYXJiZXItOTQ1YjYiLCJhdWQiOiJzbWFydGJhcmJlci05NDViNiIsImF1dGhfdGltZSI6MTc5MjMwOTgzMSwidXNlcl9pZCI6Im9rWkphQ1lua0lQZmxYVHk5T0VsU0NmZlIwTDIiLCJzdWIiOiJva1pKYUNZbmtJUGZsWFR5OU9FbFNDZmZSMEwyIiwiaWF0IjoxNzkyMzA5ODMxLCJleHAiOjE3OTIzMTM0MzEsImVtYWlsIjoibmljb2xhc3AxMmVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbIm5pY29sYXNwMTJlQGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.t3zaA-nqNlPF0-u3pkBKmdLX7WTZkYeJT1eyVFsVZJWSsIgsXnMx8ZXANR2p-t8VVVrMxsj_VwoSFJ7L5Fau2m-iENC_NiU-7_yT8DAp2sk_58wfWkaIXbsQR6l21we4dzUhs6Pq3TaI_OsxOBhg6LshrUE86ZUHEhFXeMAhRQNKAQkDrCTet_VpJG414u3403FyiMaH9MbSmcHC57orBPD-3joIWax7BNceKJQdsjudO1T9hl-0eIYA0wWd-iFP6OMziqaTh3INgLJmawGmY-X8uO4dQfBc4ip33dNErOhdL0W2WfvhRTjkWvmkgNUydLuk5eKo3Mu-rVPfwpA0sg';
    // O si prefieres del storage:
    // const token = localStorage.getItem('token') || localStorage.getItem('firebase_token') || '';

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    console.log('🚀 [ENVIANDO PETICIÓN HTTP DESDE ANGULAR]');

    return this.http.get<BarberServicePayload[]>(
      `${this.apiUrl}/barberia/${barberiaId}`,
      { headers }
    );
  }
  // 🟢 Actualizar un servicio existente por ID (PUT)
  updateService(serviceId: number | string, payload: BarberServicePayload): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar-service/${serviceId}`, payload, {
      headers: this.getHeaders()
    });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || localStorage.getItem('firebase_token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}