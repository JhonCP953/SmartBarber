import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EmployeeRepository } from '../../domain/repositories/employee.repository';
import { Employee } from '../../domain/models/employee.model';
import { EmployeeRegistration } from '../../domain/models/employee-registration.model';

@Injectable({
    providedIn: 'root'
})
export class CreateEmployeeUseCase {
    constructor(
        private readonly employeeRepository: EmployeeRepository
    ) { }

    execute(
        request: EmployeeRegistration
    ): Observable<Employee> {
        return this.employeeRepository.createEmployee(request);
    }
}