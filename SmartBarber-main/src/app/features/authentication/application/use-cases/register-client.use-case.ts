import {
  Injectable,
  inject
} from '@angular/core';

import {
  Observable,
  switchMap,
  map,
  throwError
} from 'rxjs';

import {
  ClientRegistrationForm,
  ClientRegistrationResult,
  CreateUserResponse
} from '../../domain/models/client-registration.model';

import {
  ClientRegistrationRepository
} from '../../domain/repositories/client-registration.repository';

import {
  FirebaseAuthService
} from '../../../../core/auth/services/firebase-auth.service';

import {
  SessionService
} from '../../../../core/auth/services/session.service';

import {
  USER_ROLE_IDS
} from '../../domain/models/user-role.model';

@Injectable()
export class RegisterClientUseCase {

  private readonly repository =
    inject(
      ClientRegistrationRepository
    );

  private readonly firebaseAuth =
    inject(
      FirebaseAuthService
    );

  private readonly sessionService =
    inject(
      SessionService
    );

  execute(
    form: ClientRegistrationForm
  ):
    Observable<ClientRegistrationResult> {

    const firebaseUser =
      this.firebaseAuth.getCurrentUser();

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
            'La cuenta de Google no tiene correo electrónico.'
          )
      );
    }

    return this.repository
      .createUser({

        roleId:
          USER_ROLE_IDS.CLIENT

      })

      .pipe(

        switchMap(
          (
            user: CreateUserResponse
          ) => {

            const request = {

              userId:
                user.id,

              name:
                form.name.trim(),

              document:
                form.document.trim(),

              documentType:
                form.documentType,

              cell:
                form.cell.trim(),

              email:
                firebaseUser.email!
                  .trim()
                  .toLowerCase()
            };

            return this.repository
              .createClient(
                request
              )

              .pipe(

                map(
                  client => {

                    this.sessionService
                      .setSession({

                        userId:
                          user.id,

                        clientId:
                          client.id,

                        firebaseUid:
                          firebaseUser.uid,

                        email:
                          client.email,

                        displayName:
                          client.name,

                        role:
                          'CLIENT',

                        status:
                          'ACTIVE',

                        tenantId:
                          null,

                        photoUrl:
                          firebaseUser.photoURL,

                        barberId:
                          null,

                        barbershopId:
                          null
                      });

                    return {

                      userId:
                        user.id,

                      clientId:
                        client.id,

                      message:
                        'Cliente registrado correctamente.'
                    };
                  }
                )
              );
          }
        )
      );
  }
}