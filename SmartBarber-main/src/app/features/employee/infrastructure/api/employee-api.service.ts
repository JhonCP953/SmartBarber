import {
    Injectable,
    inject
} from '@angular/core';

import {
    HttpClient,
    HttpHeaders
} from '@angular/common/http';

import {
    Observable
} from 'rxjs';

import {
    map
} from 'rxjs/operators';

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
    EmployeeRegistration,
    EmployeeRegistrationResponse
} from '../../domain/models/employee-registration.model';

@Injectable({
    providedIn: 'root'
})
export class EmployeeApiService
    extends EmployeeRepository {

    private readonly http =
        inject(HttpClient);

    override createEmployee(
        request: EmployeeRegistration,
        idToken: string
    ):
        Observable<Employee> {

        return this.http
            .post<EmployeeRegistrationResponse>(
                `${environment.apiUrl}/public/employee-service/onboarding`,
                request,
                {
                    headers: new HttpHeaders({
                        Authorization: `Bearer ${idToken}`,
                        idToken: `Bearer ${idToken}`
                    })
                }
            )
            .pipe(
                map(response => ({
                    id: response.id,
                    userId: response.user.id,
                    barberiaId: response.barberiaId,
                    document: response.document,
                    documentType: response.documentType,
                    name: response.name,
                    cell: response.cell,
                    email: response.email,
                    specialty: response.specialty,
                    createAt: response.createAt,
                    updateAt: response.updateAt ?? null
                }))
            );
    }
}