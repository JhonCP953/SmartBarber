import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionWsService } from '../../infrastructure/subscription-ws.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent implements OnInit, OnDestroy {
  isModalOpen: boolean = false;
  selectedPlan: string = '';

  // Datos internos de la suscripción que se llenan automáticamente
  nombre: string = '';
  descripcion: string = '';
  precio: number = 0;

  // Dato que ingresa el usuario
  barberShopName: string = '';

  private wsSubscription!: Subscription;

  constructor(private subscriptionWs: SubscriptionWsService) {}

  ngOnInit(): void {
    this.wsSubscription = this.subscriptionWs.getMessages().subscribe({
      next: (response) => {
        console.log('Respuesta del backend via WebSocket:', response);
        if (response && response.status === 'SUCCESS') {
          alert('¡Suscripción confirmada y vinculada a la barbería con éxito!');
          this.isModalOpen = false;
        }
      },
      error: (err) => console.error('Error recibiendo datos por WebSocket:', err)
    });
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  openPaymentModal(planName: string, planPrice: number) {
    this.selectedPlan = `${planName} - $${planPrice.toLocaleString()} / mes`;
    
    // Se asignan de forma automática para la base de datos
    this.nombre = planName;
    this.precio = planPrice;
    
    // Asignación de la descripción exacta correspondiente a la base de datos
    if (planName === 'PLAN BASICO') {
      this.descripcion = 'Plan básico para barberías con funciones esenciales.';
    } else if (planName === 'PLAN PREMIUM') {
      this.descripcion = 'Plan premium para barberías con funciones avanzadas y equipo.';
    } else if (planName === 'Plan Platinum') {
      this.descripcion = 'Suscripción platinum para barberías con máxima capacidad.';
    } else {
      this.descripcion = `Suscripción activa para el ${planName}`;
    }
    
    this.isModalOpen = true;
  }

  closePaymentModal() {
    this.isModalOpen = false;
  }

  submitPaymentForm() {
    const wrapperPayload = {
      action: 'CREATE_SUBSCRIPTION',
      data: {
        nombre: this.nombre,
        descripcion: this.descripcion,
        precio: this.precio
      },
      barberDetails: {
        barberShopName: this.barberShopName
      }
    };

    this.subscriptionWs.sendSubscription(wrapperPayload);
    alert('¡Solicitud enviada al backend para registrar plan y asociar la barbería!');
    this.isModalOpen = false;
  }
}