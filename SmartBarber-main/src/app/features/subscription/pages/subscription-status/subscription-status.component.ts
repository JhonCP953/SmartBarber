import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubscriptionService, SubscriptionPayload } from '../../infrastructure/subscription-ws.service';

@Component({
  selector: 'app-subscription-status',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subscription-status.component.html',
  styleUrls: ['./subscription-status.component.css']
})
export class SubscriptionStatusComponent implements OnInit, OnDestroy {
  subscriptionForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    // Conectar al WebSocket de pagos al iniciar
    this.subscriptionService.connectWebSocket();

    // Escuchar actualizaciones en tiempo real desde el WebSocket
    this.subscriptionService.getPaymentStatus().subscribe({
      next: (wsData) => {
        console.log('📡 [WEBSOCKET REALTIME]:', wsData);
      }
    });
  }

  ngOnDestroy(): void {
    // Cerrar WebSocket al salir de la pantalla
    this.subscriptionService.disconnectWebSocket();
  }

  private initForm(): void {
    this.subscriptionForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expirationDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      autoRenew: [true]
    });
  }

  onSubmit(): void {
    if (this.subscriptionForm.invalid) {
      alert('⚠️ Por favor completa correctamente todos los campos de pago.');
      this.subscriptionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formVal = this.subscriptionForm.value;

    const payload: SubscriptionPayload = {
      fullName: formVal.fullName,
      email: formVal.email,
      cardNumber: formVal.cardNumber,
      expirationDate: formVal.expirationDate,
      cvv: formVal.cvv,
      autoRenew: formVal.autoRenew,
      planName: 'PLAN BÁSICO',
      price: 30000
    };

    this.subscriptionService.createSubscription(payload).subscribe({
      next: (res) => {
        console.log('🚀 [HTTP SUCCESS]:', res);
        alert('¡Suscripción registrada exitosamente! 💈💳');
        this.isSubmitting = false;
        this.subscriptionForm.reset({ autoRenew: true });
      },
      error: (err) => {
        console.error('❌ [HTTP ERROR]:', err);
        alert('Hubo un inconveniente al conectar con el servidor de pago.');
        this.isSubmitting = false;
      }
    });
  }
}