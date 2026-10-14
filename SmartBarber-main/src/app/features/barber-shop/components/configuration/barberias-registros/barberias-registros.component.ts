import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { BarberShopApiService as BarberConfigApiService } from '../../../infrastructure/services/barber-shop-api.service';

@Component({
  selector: 'app-barberias-registros',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './barberias-registros.component.html',
  styleUrls: ['../shared/vintage-shared.css', './barberias-registros.component.css']
})
export class BarberiasRegistrosComponent implements OnInit {
  @Input() barberList: any[] = [];
  @Input() barberId = '';

  // Cuando el padre cambia el registro seleccionado (ej. desde "Sede Activa"), se rellena el formulario
  @Input() set seleccionado(item: any) {
    if (item && this.infoForm) {
      this.patchFormValues(item);
    }
  }

  @Output() barberiaSeleccionada = new EventEmitter<any>();
  @Output() guardado = new EventEmitter<void>();

  isEditing = false;
  searchTerm = '';
  infoForm!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly configApiService: BarberConfigApiService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.infoForm = this.fb.group({
      nombre: ['', Validators.required],
      razon_social: [''],
      tipo_documento: ['', Validators.required],
      documento: ['', Validators.required],
      celular: ['', Validators.required],
      ubicacion: ['', Validators.required],
      descripcion: [''],
      estado: ['ACTIVO']
    });
  }

  selectForEdit(item: any): void {
    this.isEditing = true;
    this.patchFormValues(item);
    this.barberiaSeleccionada.emit(item);
  }

  selectForView(item: any): void {
    this.isEditing = false;
    this.patchFormValues(item);
    this.barberiaSeleccionada.emit(item);
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  private patchFormValues(item: any): void {
    this.infoForm.patchValue({
      nombre: item.nombre ?? item.name ?? '',
      razon_social: item.razon_social ?? item.razonSocial ?? '',
      tipo_documento: item.tipo_documento ?? item.tipoDocumento ?? '',
      documento: item.documento ?? '',
      celular: item.celular ?? item.phone ?? '',
      ubicacion: item.ubicacion ?? item.location ?? '',
      descripcion: item.descripcion ?? item.description ?? '',
      estado: item.estado ?? 'ACTIVO'
    });
  }

  saveGeneralConfig(): void {
    if (this.infoForm.invalid) return;

    const formValue = this.infoForm.value;

    this.configApiService.update(this.barberId, {
      name: formValue.nombre,
      companyName: formValue.razon_social,
      documentType: formValue.tipo_documento,
      document: formValue.documento,
      phone: formValue.celular,
      location: formValue.ubicacion,
      description: formValue.descripcion
    }).subscribe({
      next: () => {
        console.log('✅ [BACKEND] Información general actualizada con éxito.');
        alert('¡Información actualizada con éxito!');
        this.isEditing = false;
        this.guardado.emit(); // el padre recarga la lista
      },
      error: (err: any) => {
        console.error('❌ [ERROR GENERAL]:', err);
        alert('Error al actualizar la información.');
      }
    });
  }
}
