import { Observable } from 'rxjs';
import { Employee } from '../models/employee.model';
import { EmployeeRegistration } from '../models/employee-registration.model';

export abstract class EmployeeRepository {
    abstract createEmployee(
        request: EmployeeRegistration
    ): Observable<Employee>;

    abstract getEmployeesByBarbershop(
        barberiaId: string
    ): Observable<Employee[]>;
}