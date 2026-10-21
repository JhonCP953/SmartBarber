import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { SessionService } from '../../../../core/auth/services/session.service';
import { BarberShopResponse } from '../../../barber-shop/domain/models/barber-shop.model';
import { BarberShopApiService } from '../../../barber-shop/infrastructure/services/barber-shop-api.service';

interface SubscriptionModuleCard {
  title: string;
  description: string;
  route: string;
  icon: string;
  state: string;
}

@Component({
  selector: 'app-subscription-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './subscription-dashboard.component.html',
  styleUrl: './subscription-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionDashboardComponent implements OnInit {
  private readonly sessionService = inject(SessionService);
  private readonly barberShopApi = inject(BarberShopApiService);

  readonly barberShop = signal<BarberShopResponse | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly modules: SubscriptionModuleCard[] = [
    {
      title: 'Estado de suscripción',
      description: 'Revisa el plan actual, su vigencia y el estado del pago.',
      route: 'status',
      icon: '◉',
      state: 'Consulta pendiente de endpoint'
    },
    {
      title: 'Renovación',
      description: 'Consulta los planes disponibles para renovar tu suscripción.',
      route: 'renewal',
      icon: '↻',
      state: 'Catálogo conectado al backend'
    },
    {
      title: 'Historial de pagos',
      description: 'Consulta las transacciones y referencias de pago.',
      route: 'payment-history',
      icon: '▤',
      state: 'Consulta pendiente de endpoint'
    },
    {
      title: 'Cancelar suscripción',
      description: 'Revisa la vigencia y las condiciones antes de cancelar.',
      route: 'cancel',
      icon: '×',
      state: 'Operación pendiente de endpoint'
    }
  ];

  isBarbershopActive(status?: string): boolean {
    return status?.toLocaleUpperCase() === 'ACTIVO' ||
      status?.toLocaleUpperCase() === 'ACTIVE';
  }

  ngOnInit(): void {
    this.loadAuthenticatedBarberShop();
  }

  private loadAuthenticatedBarberShop(): void {
    const session = this.sessionService.currentSession;

    if (!session || session.role !== 'ADMIN' || !session.barbershopId) {
      this.loading.set(false);
      this.errorMessage.set(
        'No se encontró una barbería asociada a tu perfil de administrador. Vuelve a iniciar sesión para actualizar la asociación desde el backend.'
      );
      return;
    }

    this.barberShopApi.getById(session.barbershopId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: barberShop => {
          if (!barberShop?.id || barberShop.id !== session.barbershopId) {
            this.errorMessage.set(
              'La barbería recibida no coincide con la asociada a tu perfil autenticado.'
            );
            return;
          }

          this.barberShop.set(barberShop);
        },
        error: (error: unknown) => {
          console.error('No fue posible cargar la barbería del perfil:', error);
          this.errorMessage.set(
            'No fue posible cargar la información de la barbería asociada a tu perfil.'
          );
        }
      });
  }
}
