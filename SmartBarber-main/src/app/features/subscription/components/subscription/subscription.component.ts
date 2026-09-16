import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionWsService } from '../../../../infrastructure/websocket/subscription-ws.service';
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

  // Definimos las propiedades del formulario para evitar errores de compilación
  barberShopName: string = '';
  email: string = '';
  accountNumber: string = '';
  paymentMethod: string = '';

  private wsSubscription!: Subscription;

  constructor(private subscriptionWs: SubscriptionWsService) {}

  ngOnInit(): void {
    this.wsSubscription = this.subscriptionWs.getMessages().subscribe({
      next: (response) => {
        console.log('Respuesta del backend via WebSocket:', response);
        if (response && response.status === 'SUCCESS') {
          alert('¡Suscripción confirmada en tiempo real por el servidor!');
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

  openPaymentModal(planName: string) {
    this.selectedPlan = planName;
    this.isModalOpen = true;
  }

  closePaymentModal() {
    this.isModalOpen = false;
  }

  submitPaymentForm() {
    const subscriptionPayload = {
      name: this.selectedPlan,
      description: `Suscripción activa para el plan ${this.selectedPlan}`,
      price: this.getPlanPrice(this.selectedPlan)
    };

    const wrapperPayload = {
      action: 'CREATE_SUBSCRIPTION',
      data: subscriptionPayload,
      paymentDetails: {
        barberShopName: this.barberShopName,
        email: this.email,
        accountNumber: this.accountNumber,
        paymentMethod: this.paymentMethod
      }
    };

    this.subscriptionWs.sendSubscription(wrapperPayload);
    alert('¡Solicitud de suscripción enviada al backend por WebSocket!');
    this.isModalOpen = false;
  }

  private getPlanPrice(plan: string): number {
    if (plan.includes('BARBER')) return 50000;
    if (plan.includes('SUCURSAL')) return 120000;
    if (plan.includes('MASTER')) return 220000;
    return 0;
  }
}