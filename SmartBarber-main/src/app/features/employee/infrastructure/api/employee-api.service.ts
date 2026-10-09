import {
    Injectable,
    inject
} from '@angular/core';

import {
    HttpClient
} from '@angular/common/http';

import {
    Observable
} from 'rxjs';

import {
    environment
} from '../../../../../environments/environment';

import {
    EmployeeRepository
} from '../../domain/repositories/employee.repository';

import {
    Employee
} from '../../domain/models/employee.model';

import {
    EmployeeRegistration
} from '../../domain/models/employee-registration.model';

@Injectable({
    providedIn: 'root'
})
export class EmployeeApiService
    extends EmployeeRepository {

    private readonly http =
        inject(HttpClient);

    private readonly baseUrl =
        `${environment.apiUrl}/employee-service`;

    override createEmployee(
        request: EmployeeRegistration
    ):
        Observable<Employee> {

        return this.http.post<Employee>(
            `${this.baseUrl}/crear-empleado`,
            request
        );
    }
}