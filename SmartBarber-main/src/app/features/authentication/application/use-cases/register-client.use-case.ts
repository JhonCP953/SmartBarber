import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, map } from 'rxjs';

import {
  ClientRegistrationForm,
  ClientRegistrationResult,
  CreateUserResponse
} from '../../domain/models/client-registration.model';

import { ClientRegistrationRepository } from '../../domain/repositories/client-registration.repository';

import { FirebaseAuthService } from '../../../../core/auth/services/firebase-auth.service';

@Injectable()
export class RegisterClientUseCase {

  private readonly repository =
    inject(ClientRegistrationRepository);

  private readonly firebaseAuth =
    inject(FirebaseAuthService);

  execute(
    form: ClientRegistrationForm
  ): Observable<ClientRegistrationResult> {

    const firebaseUser =
      this.firebaseAuth.getCurrentUser();

    if (!firebaseUser) {
      throw new Error(
        'No authenticated Google user was found.'
      );
    }

    const createUserRequest = {
      firebaseId: firebaseUser.uid
    };

    return this.repository.createUser(createUserRequest).pipe(

      switchMap((userResponse) => {

        const userId =
          this.extractUserId(userResponse);

        if (!userId) {
          throw new Error(
            'The backend did not return the SmartBarber user ID.'
          );
        }

        const createClientRequest = {
          userId,
          document: form.document.trim(),
          documentType: form.documentType,
          name: form.name.trim(),
          cell: form.cell.trim(),
          email: firebaseUser.email ?? ''
        };

        return this.repository.createClient(
          createClientRequest
        ).pipe(
          map((clientResponse: any) => ({
            userId,
            clientId:
              clientResponse?.id ??
              clientResponse?.clientId,
            message:
              clientResponse?.message ??
              'Client registered successfully.'
          }))
        );
      })
    );
  }

  private extractUserId(
    response: CreateUserResponse
  ): string | null {

    if (response.userId) {
      return response.userId;
    }

    if (response.id) {
      return response.id;
    }

    return null;
  }
}