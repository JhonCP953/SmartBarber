import {
    Injectable
} from '@angular/core';

import {
    Observable,
    map,
    switchMap,
    throwError
} from 'rxjs';

import {
    FirebaseAuthService
} from '../../../../core/auth/services/firebase-auth.service';

import {
    SessionService
} from '../../../../core/auth/services/session.service';

import {
    AdminRegistrationForm,
    AdminRegistrationResult,
    BarberShopOnboardingResponse
} from '../../domain/models/admin-registration.model';

import {
    BarberShopRegisterRequest
} from '../../../barber-shop/domain/models/barber-shop.model';

import {
    AdminRegistrationRepository
} from '../../domain/repositories/admin-registration.repository';

import {
    USER_ROLE_IDS
} from '../../domain/models/user-role.model';


@Injectable()
export class RegisterAdminUseCase {


    constructor(
        private readonly repository:
            AdminRegistrationRepository,

        private readonly firebaseAuthService:
            FirebaseAuthService,

        private readonly sessionService:
            SessionService
    ) { }


    execute(
        adminData: AdminRegistrationForm,
        barberShopData: BarberShopRegisterRequest
    ):
        Observable<AdminRegistrationResult> {


        const firebaseUser =
            this.firebaseAuthService
                .getCurrentUser();


        if (!firebaseUser) {

            return throwError(
                () =>
                    new Error(
                        'No existe una sesión autenticada con Google.'
                    )
            );
        }


        if (!firebaseUser.email) {

            return throwError(
                () =>
                    new Error(
                        'La cuenta de Google no tiene correo.'
                    )
            );
        }


        /*
         * =====================================================
         * ONBOARDING COMPLETO
         * =====================================================
         */

        const onboardingRequest = {

            name:
                barberShopData.name
                    .trim(),

            description:
                barberShopData.description
                    .trim(),

            location:
                barberShopData.location
                    .trim(),

            phone:
                barberShopData.phone
                    .trim(),

            document:
                barberShopData.document
                    .trim(),

            documentType:
                barberShopData.documentType,

            companyName:
                barberShopData.companyName
                    .trim(),

            employee: {

                user: {

                    roleId:
                        USER_ROLE_IDS.ADMIN

                },

                barberiaId:
                    crypto.randomUUID(),


                name:
                    adminData.name
                        .trim(),

                document:
                    adminData.document
                        .trim(),

                documentType:
                    adminData.documentType,

                cell:
                    adminData.cell
                        .trim(),

                email:
                    firebaseUser.email
                        .trim()
                        .toLowerCase(),

                specialty:
                    'Administrador'

            }

        };


        return this.repository
            .onboarding(
                onboardingRequest
            )
            .pipe(


                switchMap(
                    (
                        onboardingResponse:
                            BarberShopOnboardingResponse
                    ) => {

                        return this.repository
                            .findBarberShopByName(
                                onboardingResponse.name
                            )
                            .pipe(

                                map(
                                    barberShop => {

                                        if (
                                            !barberShop?.id
                                        ) {

                                            throw new Error(
                                                'La barbería fue creada, pero el backend no devolvió su ID.'
                                            );

                                        }


                                        const userId =
                                            onboardingResponse
                                                .employee
                                                .user
                                                .id;


                                        const employeeId =
                                            onboardingResponse
                                                .employee
                                                .id;


                                        const barberShopId =
                                            String(
                                                barberShop.id
                                            );


                                        /*
                                         * =============================================
                                         * CREAR SESIÓN
                                         * =============================================
                                         */

                                        this.sessionService
                                            .setSession({

                                                userId,

                                                clientId:
                                                    null,

                                                firebaseUid:
                                                    firebaseUser.uid,

                                                email:
                                                    onboardingResponse
                                                        .employee
                                                        .email,

                                                displayName:
                                                    onboardingResponse
                                                        .employee
                                                        .name,

                                                role:
                                                    'ADMIN',

                                                status:
                                                    onboardingResponse
                                                        .employee
                                                        .user
                                                        .status ===
                                                    'BLOCKED'
                                                        ? 'BLOCKED'
                                                        : 'ACTIVE',

                                                tenantId:
                                                    null,

                                                photoUrl:
                                                    firebaseUser.photoURL,

                                                barberId:
                                                    employeeId,

                                                barbershopId:
                                                    barberShopId

                                            });


                                        return {

                                            userId,

                                            employeeId,

                                            barberShopId,

                                            message:
                                                'Barbería, usuario y administrador registrados correctamente.'

                                        };

                                    }
                                )

                            );

                    }
                )

            );

    }

}