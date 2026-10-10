import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  RegisterAdminUseCase
} from '../../application/use-cases/register-admin.use-case';

import {
  FirebaseAuthService
} from '../../../../core/auth/services/firebase-auth.service';

import {
  DocumentType
} from '../../../barber-shop/domain/models/barber-shop.model';


@Component({
  selector: 'app-register-admin',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl:
    './register-admin.component.html',

  styleUrl:
    './register-admin.component.css',

  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class RegisterAdminComponent {

  private readonly fb =
    inject(FormBuilder);

  private readonly router =
    inject(Router);

  private readonly registerAdminUseCase =
    inject(RegisterAdminUseCase);

  private readonly firebaseAuthService =
    inject(FirebaseAuthService);


  // =========================================================
  // ESTADO
  // =========================================================

  readonly currentStep =
    signal<1 | 2>(1);

  readonly loading =
    signal(false);

  readonly success =
    signal(false);

  readonly errorMessage =
    signal('');


  // =========================================================
  // USUARIO FIREBASE
  // =========================================================

  readonly firebaseUser =
    this.firebaseAuthService
      .getCurrentUser();


  readonly email =
    computed(
      () =>
        this.firebaseUser?.email ?? ''
    );


  // =========================================================
  // FORMULARIO BARBERÍA
  // =========================================================

  readonly barberShopForm =
    this.fb.nonNullable.group({

      name: [

        '',

        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(120)
        ]

      ],

      description: [

        '',

        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500)
        ]

      ],

      location: [

        '',

        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(200)
        ]

      ],

      phone: [

        '',

        [
          Validators.required,
          Validators.pattern(
            /^3[0-9]{9}$/
          )
        ]

      ],

      document: [

        '',

        [
          Validators.required,
          Validators.pattern(
            /^[0-9]{5,20}$/
          )
        ]

      ],

      documentType: [

        'NIT' as DocumentType,

        [
          Validators.required
        ]

      ],

      companyName: [

        '',

        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(150)
        ]

      ]

    });


  // =========================================================
  // FORMULARIO ADMINISTRADOR
  // =========================================================

  readonly adminForm =
    this.fb.nonNullable.group({

      name: [

        this.firebaseUser?.displayName ?? '',

        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100)
        ]

      ],

      document: [

        '',

        [
          Validators.required,
          Validators.pattern(
            /^[0-9]{6,20}$/
          )
        ]

      ],

      documentType: [

        'CC' as DocumentType,

        [
          Validators.required
        ]

      ],

      cell: [

        '',

        [
          Validators.required,
          Validators.pattern(
            /^3[0-9]{9}$/
          )
        ]

      ]

    });


  // =========================================================
  // GETTERS ADMIN
  // =========================================================

  get name() {

    return this.adminForm
      .controls
      .name;

  }


  get document() {

    return this.adminForm
      .controls
      .document;

  }


  get documentType() {

    return this.adminForm
      .controls
      .documentType;

  }


  get cell() {

    return this.adminForm
      .controls
      .cell;

  }


  // =========================================================
  // GETTERS BARBERÍA
  // =========================================================

  get barberShopName() {

    return this.barberShopForm
      .controls
      .name;

  }


  get barberShopDescription() {

    return this.barberShopForm
      .controls
      .description;

  }


  get location() {

    return this.barberShopForm
      .controls
      .location;

  }


  get phone() {

    return this.barberShopForm
      .controls
      .phone;

  }


  get barberShopDocument() {

    return this.barberShopForm
      .controls
      .document;

  }


  get barberShopDocumentType() {

    return this.barberShopForm
      .controls
      .documentType;

  }


  get companyName() {

    return this.barberShopForm
      .controls
      .companyName;

  }


  // =========================================================
  // PASO 1 → PASO 2
  // =========================================================

  goToAdminStep(): void {

    this.errorMessage.set('');

    if (
      this.barberShopForm.invalid
    ) {

      this.barberShopForm
        .markAllAsTouched();

      this.errorMessage.set(
        'Completa correctamente los datos de la barbería antes de continuar.'
      );

      return;
    }

    this.currentStep.set(2);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }


  // =========================================================
  // PASO 2 → PASO 1
  // =========================================================

  goToBarberShopStep(): void {

    if (this.loading()) {
      return;
    }

    this.errorMessage.set('');

    this.currentStep.set(1);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }


  // =========================================================
  // VOLVER AL REGISTRO GENERAL
  // =========================================================

  goBackToRegister(): void {

    if (this.loading()) {
      return;
    }

    this.router.navigate([
      '/auth/register'
    ]);

  }


  // =========================================================
  // REGISTRO FINAL
  // =========================================================

  submit(): void {

    this.errorMessage.set('');

    if (this.loading()) {
      return;
    }


    // -------------------------------------------------------
    // FIREBASE
    // -------------------------------------------------------

    if (!this.firebaseUser) {

      this.errorMessage.set(
        'Debes iniciar sesión con Google antes de registrar la barbería.'
      );

      return;
    }


    if (!this.firebaseUser.email) {

      this.errorMessage.set(
        'No fue posible obtener el correo de tu cuenta de Google.'
      );

      return;
    }


    // -------------------------------------------------------
    // VALIDAR ADMINISTRADOR
    // -------------------------------------------------------

    if (
      this.adminForm.invalid
    ) {

      this.adminForm
        .markAllAsTouched();

      this.errorMessage.set(
        'Completa correctamente los datos del administrador.'
      );

      return;
    }


    // -------------------------------------------------------
    // VALIDAR BARBERÍA
    // -------------------------------------------------------

    if (
      this.barberShopForm.invalid
    ) {

      this.currentStep.set(1);

      this.barberShopForm
        .markAllAsTouched();

      this.errorMessage.set(
        'Revisa los datos de la barbería.'
      );

      return;
    }


    this.loading.set(true);


    const adminData =
      this.adminForm.getRawValue();


    const barberShopData =
      this.barberShopForm.getRawValue();


    // -------------------------------------------------------
    // EJECUTAR FLUJO
    //
    // 1. Barbería
    // 2. Usuario roleId = 4
    // 3. Administrador
    // -------------------------------------------------------

    this.registerAdminUseCase
      .execute(
        adminData,
        barberShopData
      )
      .subscribe({

        next: () => {

          this.loading.set(false);

          this.success.set(true);

          this.errorMessage.set('');

          setTimeout(
            () => {

              this.router.navigate([
                '/'
              ]);

            },
            2200
          );

        },


        error: (error) => {

          console.error(
            'Error durante el registro del administrador:',
            error
          );

          this.loading.set(false);

          this.errorMessage.set(
            this.getErrorMessage(error)
          );

        }

      });

  }


  // =========================================================
  // MENSAJE DE ERROR
  // =========================================================

  private getErrorMessage(
    error: unknown
  ): string {

    const httpError =
      error as {

        status?: number;

        error?: {

          data?: {

            message?: string;

          };

          message?: string;

        };

        message?: string;

      };


    const message =
      httpError?.error?.data?.message ??
      httpError?.error?.message ??
      httpError?.message;


    if (
      httpError?.status === 400
    ) {

      return (
        message ??
        'Los datos enviados no son válidos.'
      );

    }


    if (
      httpError?.status === 401
    ) {

      return (
        'La sesión de Google no es válida. Inicia sesión nuevamente.'
      );

    }


    if (
      httpError?.status === 403
    ) {

      return (
        'No tienes autorización para realizar este registro.'
      );

    }


    if (
      httpError?.status === 409
    ) {

      return (
        message ??
        'Ya existe información registrada con estos datos.'
      );

    }


    if (
      httpError?.status &&
      httpError.status >= 500
    ) {

      return (
        'El servidor no pudo completar el registro. Inténtalo nuevamente más tarde.'
      );

    }


    return (
      message ??
      'No fue posible completar el registro. Inténtalo nuevamente.'
    );


  }

}