import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SubscriptionWsService } from '../../infrastructure/subscription-ws.service'; 

@Component({
  selector: 'app-subscription-plans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.css']
})
export class SubscriptionPlansComponent implements OnInit, OnDestroy {
  isModalOpen = false;
  isLoading = false;
  selectedPlan = '';

  nombre = '';
  descripcion = '';
  precio = 0;
  barberShopName = '';

  private wsSubscription!: Subscription;
  private timeoutHandle: any;

  constructor(private subscriptionWs: SubscriptionWsService) {}

  ngOnInit(): void {
    this.wsSubscription = this.subscriptionWs.getMessages().subscribe({
      next: (response: any) => {
        this.clearSubTimeout();
        this.isLoading = false;
        console.log('Respuesta del backend via WebSocket:', response);
        
        if (response && response.status === 'SUCCESS') {
          alert('¡Suscripción confirmada y vinculada a la barbería con éxito!');
          this.isModalOpen = false;
          this.barberShopName = '';
        }
      },
      error: (err: any) => {
        this.clearSubTimeout();
        this.isLoading = false;
        console.error('Error en la comunicación WebSocket:', err);
        alert('Hubo un error al procesar la suscripción con el servidor.');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.clearSubTimeout();
  }

  private clearSubTimeout() {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
  }

  openPaymentModal(planName: string, planPrice: number) {
    this.selectedPlan = `${planName} - $${planPrice.toLocaleString()} / mes`;
    this.nombre = planName;
    this.precio = planPrice;
    this.barberShopName = '';
    this.isLoading = false;
    this.clearSubTimeout();
    
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
    this.clearSubTimeout();
  }

  submitPaymentForm() {
    if (!this.barberShopName.trim()) return;

    this.isLoading = true;

    const wrapperPayload = {
      action: 'CREATE_SUBSCRIPTION',
      data: {
        nombre: this.nombre,
        descripcion: this.descripcion,
        precio: this.precio
      },
      barberDetails: {
        barberShopName: this.barberShopName.trim()
      }
    };

    this.subscriptionWs.sendSubscription(wrapperPayload);

    this.clearSubTimeout();
    this.timeoutHandle = setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.isModalOpen = false;
        this.barberShopName = '';
        alert(' Solicitud en cola. La confirmación y credenciales de acceso serán enviadas a su correo electrónico.');
      }
    }, 15000);
  }
}