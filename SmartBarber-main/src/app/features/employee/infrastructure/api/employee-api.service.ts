import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EmployeeRepository } from '../../domain/repositories/employee.repository';
import { Employee } from '../../domain/models/employee.model';
import { EmployeeRegistration } from '../../domain/models/employee-registration.model';

@Injectable({
    providedIn: 'root'
})
export class EmployeeApiService extends EmployeeRepository {
    private readonly baseUrl = 'http://localhost:8080/employee-service';

    constructor(private readonly http: HttpClient) {
        super();
    }

    override createEmployee(
        request: EmployeeRegistration
    ): Observable<Employee> {
        return this.http.post<Employee>(
            `${this.baseUrl}/crear-empleado`,
            request
        );
    }

    override getEmployeesByBarbershop(
        barberiaId: string
    ): Observable<Employee[]> {
        return this.http.get<Employee[]>(
            `${this.baseUrl}/barberia/${barberiaId}`
        );
    }
}