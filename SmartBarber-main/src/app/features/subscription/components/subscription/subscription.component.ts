import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent {
  isModalOpen: boolean = false;
  selectedPlan: string = '';

  openPaymentModal(planName: string) {
    this.selectedPlan = planName;
    this.isModalOpen = true;
  }

  closePaymentModal() {
    this.isModalOpen = false;
  }

  submitPaymentForm() {
    alert('¡Solicitud de suscripción recibida con éxito! Te redirigiremos a la pasarela de pago.');
    this.isModalOpen = false;
  }
}