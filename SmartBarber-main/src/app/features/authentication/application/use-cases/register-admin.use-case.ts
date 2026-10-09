import {
  Injectable
} from '@angular/core';

import {
  Observable,
  map,
  throwError,
  of
} from 'rxjs';

import {
  switchMap
} from 'rxjs/operators';

import {
  FirebaseAuthService
} from '../../../../core/auth/services/firebase-auth.service';

import {
  SessionService
} from '../../../../core/auth/services/session.service';

import {
  AdminRegistrationForm,
  AdminRegistrationResult
} from '../../domain/models/admin-registration.model';

import {
  BarberShopRegisterRequest,
  BarberShopResponse,
} from '../../../barber-shop/domain/models/barber-shop.model';

import {
  AdminRegistrationRepository
} from '../../domain/repositories/admin-registration.repository';

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
  ): Observable<AdminRegistrationResult> {

    const firebaseUser =
      this.firebaseAuthService.getCurrentUser();

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
     * PASO 1
     * CREAR BARBERÍA
     * =====================================================
     */
    return this.repository
      .createBarberShop(barberShopData)

      .pipe(

        /*
         * Si el backend devuelve la barbería correctamente
         * se utiliza directamente.
         *
         * Si devuelve null o no devuelve ID,
         * se consulta nuevamente por nombre.
         */
        switchMap(
          (barberShop: BarberShopResponse | null ) => {

            // ==========================================
            // BARBERÍA CREADA CORRECTAMENTE
            // ==========================================

            if (barberShop?.id) {
              return of(barberShop);
            }

            // ==========================================
            // FALLBACK:
            // BUSCAR LA BARBERÍA POR NOMBRE
            // ==========================================

            return this.repository
              .findBarberShopByName(
                barberShopData.name.trim()
              )
              .pipe(

                switchMap(
                  (foundBarberShop: BarberShopResponse | null) => {

                    // ==========================================
                    // BARBERÍA ENCONTRADA CON ID
                    // ==========================================

                    if (foundBarberShop?.id) {
                      return of(foundBarberShop);
                    }

                    // ==========================================
                    // NO SE PUDO OBTENER EL ID
                    // ==========================================

                    return throwError(
                      () =>
                        new Error(
                          'La barbería fue creada, pero el backend no devolvió su ID.'
                        )
                    );
                  }
                )

              );
          }
        ),

      
        switchMap(
          (
            barberShop:
              BarberShopResponse
          ) => {

            if (
              !barberShop ||
              !barberShop.id
            ) {

              return throwError(
                () =>
                  new Error(
                    'La barbería fue creada, pero el backend no devolvió su ID.'
                  )
              );
            }

            const barberShopId =
              String(barberShop.id);

            /*
             * =====================================================
             * PASO 2
             * CREAR USUARIO ADMINISTRADOR
             * =====================================================
             */
            return this.repository
              .createUser({
                roleId: 4
              })

              .pipe(

                switchMap(
                  (
                    userResponse
                  ) => {

                    if (!userResponse) {

                      return throwError(
                        () =>
                          new Error(
                            'El backend no devolvió información del usuario.'
                          )
                      );
                    }

                    const userId =
                      userResponse.id ??
                      userResponse.userId;

                    if (!userId) {

                      return throwError(
                        () =>
                          new Error(
                            'El backend no devolvió el ID del usuario.'
                          )
                      );
                    }

                    /*
                     * =====================================================
                     * PASO 3
                     * CREAR ADMINISTRADOR Y ASOCIARLO
                     * A LA BARBERÍA
                     * =====================================================
                     */
                    return this.repository
                      .createAdmin({

                        userId,

                        barberiaId:
                          barberShopId,

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
                          firebaseUser.email!
                            .trim()
                            .toLowerCase(),

                        specialty:
                          'Administrador'

                      })

                      .pipe(

                        map(
                          (
                            adminResponse
                          ) => {

                            if (!adminResponse) {

                              throw new Error(
                                'El backend no devolvió información del administrador.'
                              );
                            }

                            const adminId =
                              adminResponse.id ??
                              adminResponse.adminId;

                            if (!adminId) {

                              throw new Error(
                                'El backend no devolvió el ID del administrador.'
                              );
                            }

                            /*
                             * =====================================================
                             * SESIÓN
                             * =====================================================
                             */
                            this.sessionService
                              .setSession({

                                userId,

                                clientId:
                                  null,

                                firebaseUid:
                                  firebaseUser.uid,

                                email:
                                  firebaseUser.email!,

                                displayName:
                                  adminData.name,

                                role:
                                  'ADMIN',

                                status:
                                  'ACTIVE',

                                tenantId:
                                  null,

                                photoUrl:
                                  firebaseUser.photoURL,

                                barberId:
                                  adminId,

                                barbershopId:
                                  barberShopId

                              });

                            return {

                              userId,

                              employeeId:
                                adminId,

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
        )
      );
  }
}