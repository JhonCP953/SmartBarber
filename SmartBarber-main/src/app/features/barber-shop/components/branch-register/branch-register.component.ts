import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  BarberShopRegisterRequest,
  BarberShopResponse
} from '../../domain/models/barber-shop.model';

import {
  BarberShopApiService
} from '../../infrastructure/services/barber-shop-api.service';

@Component({
  selector: 'app-branch-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './branch-register.component.html',
  styleUrl: './branch-register.component.css'
})
export class BranchRegisterComponent implements OnInit {

  activeTab: 'login' | 'signup' = 'signup';

  loginData = {
    email: '',
    password: ''
  };

  registerData: BarberShopRegisterRequest = {
    name: '',
    description: '',
    location: '',
    phone: '',
    document: '',
    documentType: 'NIT',
    companyName: ''
  };

  branches: BarberShopResponse[] = [];

  constructor(
    private readonly barberShopApiService: BarberShopApiService
  ) { }

  ngOnInit(): void {
    this.cargarBarberias();
  }

  switchTab(tab: 'login' | 'signup'): void {
    this.activeTab = tab;
  }

  cargarBarberias(): void {

    this.barberShopApiService
      .getAll()
      .subscribe({

        next: (data: BarberShopResponse[]) => {

          this.branches = data;

          console.log(
            'Barberías obtenidas:',
            data
          );
        },

        error: (err: unknown) => {

          console.error(
            'Error al obtener la lista de barberías:',
            err
          );

        }

      });
  }



  onLogin(): void {
    console.log(
      'Iniciando sesión:',
      this.loginData
    );

    alert(
      `¡Bienvenido de nuevo, ${this.loginData.email}!`
    );
  }

  onRegisterBranch(): void {

    if (
      !this.registerData.name ||
      !this.registerData.document
    ) {
      return;
    }

    console.log(
      'Payload a enviar al backend:',
      this.registerData
    );

    this.barberShopApiService
      .createBarberShop(this.registerData)
      .subscribe({

        next: (res: BarberShopResponse) => {

          console.log(
            'Barbería registrada:',
            res
          );

          alert(
            `¡Barbería "${this.registerData.name}" registrada con éxito!`
          );

          this.resetForm();

          this.cargarBarberias();
        },

        error: (err: unknown) => {

          console.error(
            'Error al registrar barbería:',
            err
          );

          alert(
            'Ocurrió un error al intentar guardar en el servidor.'
          );
        }
      });
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