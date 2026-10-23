import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { SessionService } from '../../../../core/auth/services/session.service';
import { BarbershopSubscriptionAccessService } from '../../application/services/barbershop-subscription-access.service';
import { SubscriptionCatalogPlan } from '../../domain/models/subscription-catalog.model';
import {
  SubscriptionApiService
} from '../../infrastructure/api/subscription-api.service';
import {
  SubscriptionCreationResponse,
  SubscriptionWsService
} from '../../infrastructure/subscription-ws.service';

@Component({
  selector: 'app-subscription-status',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './subscription-status.component.html',
  styleUrl: './subscription-status.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionStatusComponent implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly sessionService = inject(SessionService);
  private readonly subscriptionAccess = inject(BarbershopSubscriptionAccessService);
  private readonly subscriptionApi = inject(SubscriptionApiService);
  private readonly subscriptionWs = inject(SubscriptionWsService);
  private paymentSubscription?: Subscription;

  readonly plans = signal<SubscriptionCatalogPlan[]>([]);
  readonly selectedPlanId = signal<number | null>(null);
  readonly selectedPlan = computed(() =>
    this.plans().find(plan => plan.id === this.selectedPlanId()) ?? null
  );
  readonly subscriptionForm = this.formBuilder.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expirationDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    autoRenew: [true]
  });
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly paymentMessage = signal('');
  readonly createdSubscription = signal<SubscriptionCreationResponse | null>(null);

  ngOnInit(): void {
    this.loadPlans();
  }

  ngOnDestroy(): void {
    this.paymentSubscription?.unsubscribe();
    this.subscriptionWs.disconnectWebSocket();
  }

  selectPlan(planId: number): void {
    this.selectedPlanId.set(planId);
    this.errorMessage.set('');
    this.paymentMessage.set('');
    this.createdSubscription.set(null);
  }

  acquireSubscription(): void {
    const planId = this.selectedPlanId();

    if (planId === null || this.submitting()) {
      return;
    }

    if (this.subscriptionForm.invalid) {
      this.subscriptionForm.markAllAsTouched();
      return;
    }

    const selectedPlan = this.plans().find(plan => plan.id === planId);
    if (!selectedPlan) {
      this.errorMessage.set('Selecciona un plan válido del catálogo.');
      return;
    }

    const formValue = this.subscriptionForm.getRawValue();
    this.errorMessage.set('');
    this.paymentMessage.set('');
    this.submitting.set(true);

    let createRequest: Observable<SubscriptionCreationResponse>;
    try {
      createRequest = this.subscriptionWs.createSubscription({
        subscriptionId: planId,
        duration: 60,
        automaticRenew: formValue.autoRenew ?? false,
        fullName: formValue.fullName,
        email: formValue.email,
        cardNumber: formValue.cardNumber,
        expirationDate: formValue.expirationDate,
        cvv: formValue.cvv,
        autoRenew: formValue.autoRenew ?? false,
        planName: selectedPlan.name,
        price: selectedPlan.price
      });
    } catch (error: unknown) {
      this.submitting.set(false);
      this.errorMessage.set(
        error instanceof Error
          ? error.message
          : 'No fue posible validar el perfil para adquirir el plan.'
      );
      return;
    }

    createRequest.subscribe({
      next: response => {
        this.submitting.set(false);
        this.createdSubscription.set(response);
        this.subscriptionForm.patchValue({
          cardNumber: '',
          expirationDate: '',
          cvv: ''
        });

        this.paymentSubscription?.unsubscribe();
        this.paymentSubscription = this.subscriptionWs.getPaymentStatus().subscribe({
          next: event => {
            this.paymentMessage.set(this.getPaymentUpdateMessage(event));
            this.subscriptionAccess.refresh();
          },
          error: (error: unknown) => {
            console.error('Error al recibir la actualización del pago:', error);
            this.errorMessage.set(
              'La solicitud fue creada, pero no se pudo recibir la actualización del pago.'
            );
          }
        });

        try {
          this.subscriptionWs.connectWebSocket(response.orderId);
          this.paymentMessage.set(
            'Solicitud de pago creada. Esperando confirmación de la transacción.'
          );
        } catch (error: unknown) {
          console.error('No fue posible conectar con el estado del pago:', error);
          this.errorMessage.set(
            error instanceof Error
              ? error.message
              : 'No fue posible conectar con el estado del pago.'
          );
        }
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        console.error('No fue posible crear la solicitud de suscripción:', error);
        this.errorMessage.set(
          'No fue posible iniciar la adquisición. Revisa la información e inténtalo nuevamente.'
        );
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.subscriptionForm.get(fieldName);
    return Boolean(field && field.invalid && field.touched);
  }

  fieldError(fieldName: string): string {
    const field = this.subscriptionForm.get(fieldName);

    if (!field?.errors) {
      return '';
    }

    if (field.errors['required']) {
      return 'Este campo es obligatorio.';
    }

    if (field.errors['email']) {
      return 'Ingresa un correo electrónico válido.';
    }

    if (field.errors['minlength']) {
      return 'Ingresa al menos 3 caracteres.';
    }

    if (fieldName === 'cardNumber' || fieldName === 'cvv') {
      return 'Revisa la cantidad de dígitos ingresada.';
    }

    if (fieldName === 'expirationDate') {
      return 'Usa el formato MM/AA o MM/AAAA.';
    }

    return 'Revisa este dato.';
  }

  private loadPlans(): void {
    const session = this.sessionService.currentSession;

    if (
      !session ||
      session.role !== 'ADMIN' ||
      !session.barberId ||
      !session.barbershopId
    ) {
      this.loading.set(false);
      this.errorMessage.set(
        'La adquisición está disponible para el administrador asociado a una barbería. Inicia sesión nuevamente si tu perfil fue actualizado.'
      );
      return;
    }

    this.subscriptionApi.getSubscriptionCatalog().subscribe({
      next: plans => {
        this.plans.set(plans);
        if (plans.length === 1) {
          this.selectedPlanId.set(plans[0].id);
        }
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('No fue posible cargar los planes de suscripción:', error);
        this.errorMessage.set(
          'No fue posible consultar los planes disponibles. Inténtalo nuevamente.'
        );
        this.loading.set(false);
      }
    });
  }

  private getPaymentUpdateMessage(event: unknown): string {
    if (
      typeof event === 'object' &&
      event !== null &&
      'status' in event &&
      typeof event.status === 'string'
    ) {
      return `Estado de la transacción: ${event.status}.`;
    }

    return 'Se recibió una actualización de la transacción.';
  }
}
