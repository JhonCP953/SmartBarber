import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BarberShopRegisterRequest, BarberShopResponse } from '../../../../shared/models/barber-shop.interface';
import { BarberiaService } from '../../../../shared/models/barberia.service';

@Component({
  selector: 'app-branch-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branch-register.component.html',
  styleUrl: './branch-register.component.css'
})
export class BranchRegisterComponent implements OnInit {
  // Pestaña activa: 'login' | 'signup'
  activeTab: 'login' | 'signup' = 'signup';

  // Datos de Login
  loginData = {
    email: '',
    password: ''
  };

  // Objeto para formulario de registro ajustado a la API POST del backend
  registerData: BarberShopRegisterRequest = {
    name: '',
    description: '',
    location: '',
    phone: '',
    document: '',
    documentType: 'NIT',
    companyName: ''
  };

  // Lista de barberías enviadas por la API
  branches: BarberShopResponse[] = [];

  constructor(private barberiaService: BarberiaService) {}

  ngOnInit(): void {
    this.cargarBarberias();
  }

  switchTab(tab: 'login' | 'signup'): void {
    this.activeTab = tab;
  }

  // Cargar lista desde la API
  cargarBarberias(): void {
    this.barberiaService.obtenerBarberias().subscribe({
      next: (data: BarberShopResponse[]) => {
        this.branches = data;
      },
      error: (err) => {
        console.error('Error al obtener la lista de barberías:', err);
      }
    });
  }

  onLogin(): void {
    console.log('Iniciando sesión:', this.loginData);
    alert(`¡Bienvenido de nuevo, ${this.loginData.email}!`);
  }

  // Enviar el registro a la API
  onRegisterBranch(): void {
    if (this.registerData.name && this.registerData.document) {
      console.log('Payload a enviar al backend:', this.registerData);

      this.barberiaService.crearBarberia(this.registerData).subscribe({
        next: (res: BarberShopResponse) => {
          alert(`¡Barbería "${this.registerData.name}" registrada con éxito!`);
          this.resetForm();
          this.cargarBarberias(); // Refrescar la lista de la API
        },
        error: (err) => {
          console.error('Error al registrar barbería:', err);
          alert('Ocurrió un error al intentar guardar en el servidor.');
        }
      });
    }
  }

  private resetForm(): void {
    this.registerData = {
      name: '',
      description: '',
      location: '',
      phone: '',
      document: '',
      documentType: 'NIT',
      companyName: ''
    };
  }
}