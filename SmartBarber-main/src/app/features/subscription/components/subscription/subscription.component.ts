import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionWsService } from '../../infrastructure/subscription-ws.service';
import { Subscription } from 'rxjs';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent implements OnInit, OnDestroy {
  isModalOpen: boolean = false;
  isLoading: boolean = false;
  selectedPlan: string = '';

  nombre: string = '';
  descripcion: string = '';
  precio: number = 0;
  barberShopName: string = '';

  private wsSubscription!: Subscription;
  private timeoutHandle: any; // Referencia para limpiar el temporizador

  constructor(private subscriptionWs: SubscriptionWsService) {}

  ngOnInit(): void {
    this.wsSubscription = this.subscriptionWs.getMessages().subscribe({
      next: (response) => {
        this.clearSubTimeout(); // Limpiamos el temporizador si llegó respuesta a tiempo
        this.isLoading = false;
        console.log('Respuesta del backend via WebSocket:', response);
        
        if (response && response.status === 'SUCCESS') {
          alert('¡Suscripción confirmada y vinculada a la barbería con éxito!');
          this.isModalOpen = false;
          this.barberShopName = '';
        }
      },
      error: (err) => {
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

    // Activamos el temporizador de 15 segundos (15000 ms)
    this.clearSubTimeout();
    this.timeoutHandle = setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.isModalOpen = false;
        this.barberShopName = '';
        alert('¡Solicitud en proceso! El servidor está tardando en responder. En cuanto la suscripción se complete con éxito, te enviaremos la confirmación y detalles a tu correo electrónico registrado.');
      }
    }, 15000);
  }
}