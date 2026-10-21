import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  BarberShopApiService
} from '../../../infrastructure/services/barber-shop-api.service';

import {
  BarberShopResponse
} from '../../../domain/models/barber-shop.model';


@Component({
  selector: 'app-barberias-registros',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl:
    './barberias-registros.component.html',

  styleUrls: [
    './barberias-registros.component.css'
  ]
})
export class BarberiasRegistrosComponent
  implements OnInit {


  @Input()
  barberList: BarberShopResponse[] = [];


  @Input()
  barberId = '';


  @Input()
  set seleccionado(
    item: BarberShopResponse | null
  ) {

    if (
      item &&
      this.infoForm
    ) {

      this.patchFormValues(item);

      this.selectedId =
        String(item.id ?? '');
    }
  }


  @Output()
  barberiaSeleccionada =
    new EventEmitter<BarberShopResponse>();


  @Output()
  guardado =
    new EventEmitter<void>();


  infoForm!: FormGroup;

  isEditing = false;

  selectedId = '';

  saving = false;

  formError = '';


  constructor(
    private readonly fb: FormBuilder,

    private readonly api:
      BarberShopApiService
  ) {}


  ngOnInit(): void {
    this.initForm();
  }


  private initForm(): void {

    this.infoForm =
      this.fb.group({

        nombre: [
          '',
          [
            Validators.required,
            Validators.maxLength(100)
          ]
        ],

        razonSocial: [
          '',
          Validators.maxLength(150)
        ],

        tipoDocumento: [
          '',
          Validators.required
        ],

        documento: [
          '',
          [
            Validators.required,
            Validators.maxLength(50)
          ]
        ],

        telefono: [
          '',
          Validators.required
        ],

        ubicacion: [
          '',
          Validators.required
        ],

        descripcion: [
          '',
          Validators.maxLength(500)
        ]

      });
  }


  // ============================================================
  // SELECCIONAR PARA EDITAR
  // ============================================================

  edit(item: BarberShopResponse): void {

    this.isEditing = true;

    this.selectedId =
      String(item.id ?? '');

    this.patchFormValues(item);

    this.barberiaSeleccionada.emit(item);
  }


  // ============================================================
  // CONSULTAR
  // ============================================================

  view(item: BarberShopResponse): void {

    this.isEditing = false;

    this.selectedId =
      String(item.id ?? '');

    this.patchFormValues(item);

    this.barberiaSeleccionada.emit(item);
  }


  // ============================================================
  // FORMULARIO
  // ============================================================

  private patchFormValues(
    item: BarberShopResponse
  ): void {

    this.infoForm.patchValue({

      nombre:
        item.name ?? '',

      razonSocial:
        item.companyName ?? '',

      tipoDocumento:
        item.documentType ?? '',

      documento:
        item.document ?? '',

      telefono:
        item.phone ?? '',

      ubicacion:
        item.location ?? '',

      descripcion:
        item.description ?? ''

    });
  }


  // ============================================================
  // CANCELAR
  // ============================================================

  cancelEdit(): void {

    this.isEditing = false;

    this.formError = '';
  }


  // ============================================================
  // GUARDAR
  // ============================================================

  saveGeneralConfig(): void {

    if (
      this.infoForm.invalid ||
      this.saving
    ) {

      this.infoForm.markAllAsTouched();

      return;
    }


    if (!this.selectedId) {

      this.formError =
        'No se identificó la barbería que deseas actualizar.';

      return;
    }


    const value =
      this.infoForm.getRawValue();


    this.saving = true;

    this.formError = '';


    this.api
      .update(
        this.selectedId,
        {

          name:
            value.nombre.trim(),

          companyName:
            value.razonSocial?.trim() || '',

          documentType:
            value.tipoDocumento,

          document:
            value.documento.trim(),

          phone:
            value.telefono.trim(),

          location:
            value.ubicacion.trim(),

          description:
            value.descripcion?.trim() || ''

        }
      )
      .subscribe({

        next: (updated) => {

          this.saving = false;

          this.isEditing = false;

          this.barberiaSeleccionada.emit(
            updated
          );

          this.guardado.emit();
        },

        error: (error) => {

          console.error(
            '[Mi barbería] Error actualizando:',
            error
          );

          this.saving = false;

          this.formError =
            'No fue posible actualizar la información de la barbería.';
        }

      });
  }


  // ============================================================
  // HELPERS
  // ============================================================

  getFieldInvalid(
    field: string
  ): boolean {

    const control =
      this.infoForm.get(field);

    return !!control &&
      control.invalid &&
      control.touched;
  }
}