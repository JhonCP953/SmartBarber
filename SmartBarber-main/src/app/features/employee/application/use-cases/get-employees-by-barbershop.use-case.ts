import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EmployeeRepository } from '../../domain/repositories/employee.repository';
import { Employee } from '../../domain/models/employee.model';

@Injectable({
    providedIn: 'root'
})
export class GetEmployeesByBarbershopUseCase {
    constructor(
        private readonly employeeRepository: EmployeeRepository
    ) { }

    execute(barberiaId: string): Observable<Employee[]> {
        return this.employeeRepository
            .getEmployeesByBarbershop(barberiaId);
    }
}