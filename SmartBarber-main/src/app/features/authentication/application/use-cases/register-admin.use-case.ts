import { Injectable } from '@angular/core';
import { from, Observable, switchMap, map, throwError } from 'rxjs';

import { FirebaseAuthService } from '../../../../core/auth/services/firebase-auth.service';

import {
    AdminRegistrationForm,
    AdminRegistrationResult
} from '../../domain/models/admin-registration.model';

import {
    BarberShopRegisterRequest
} from '../../../barber-shop/domain/models/barber-shop.model';

import {
    AdminRegistrationRepository
} from '../../domain/repositories/admin-registration.repository';

@Injectable()
export class RegisterAdminUseCase {

    constructor(
        private readonly repository: AdminRegistrationRepository,
        private readonly firebaseAuthService: FirebaseAuthService
    ) { }

    execute(
        adminData: AdminRegistrationForm,
        barberShopData: BarberShopRegisterRequest
    ): Observable<AdminRegistrationResult> {

        const firebaseUser =
            this.firebaseAuthService.getCurrentUser();

        if (!firebaseUser) {
            return throwError(
                () => new Error(
                    'No existe una sesión autenticada con Google.'
                )
            );
        }

        const firebaseId = firebaseUser.uid;

        const email = firebaseUser.email;

        if (!email) {
            return throwError(
                () => new Error(
                    'No fue posible obtener el correo de Google.'
                )
            );
        }

        return this.repository
            .createUser(firebaseId)
            .pipe(

                switchMap((userResponse: any) => {

                    const userId =
                        userResponse?.userId ??
                        userResponse?.id;

                    if (!userId) {
                        throw new Error(
                            'El backend no devolvió el ID interno del usuario.'
                        );
                    }

                    /*
                     * El flujo continúa con la información
                     * necesaria para asociar al administrador.
                     */

                    return this.repository
                        .createAdmin({
                            userId,
                            name: adminData.name,
                            cell: adminData.cell,
                            email
                        })
                        .pipe(

                            switchMap((adminResponse) => {

                                return this.repository
                                    .createBarberShop(barberShopData)
                                    .pipe(

                                        map(() => ({
                                            userId,
                                            adminId:
                                                adminResponse.adminId ??
                                                adminResponse.id,
                                            message:
                                                'Administrador y barbería registrados correctamente.'
                                        }))
                                    );
                            })
                        );
                })
            );
    }
}