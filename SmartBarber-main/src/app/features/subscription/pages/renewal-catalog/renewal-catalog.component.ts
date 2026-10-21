import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { SessionService } from '../../../../core/auth/services/session.service';
import { BarberShopResponse } from '../../../barber-shop/domain/models/barber-shop.model';
import { BarberShopApiService } from '../../../barber-shop/infrastructure/services/barber-shop-api.service';
import { SubscriptionCatalogPlan } from '../../domain/models/subscription-catalog.model';
import { SubscriptionApiService } from '../../infrastructure/api/subscription-api.service';

@Component({
  selector: 'app-renewal-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './renewal-catalog.component.html',
  styleUrl: './renewal-catalog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RenewalCatalogComponent implements OnInit {
  private readonly sessionService = inject(SessionService);
  private readonly barberShopApi = inject(BarberShopApiService);
  private readonly subscriptionApi = inject(SubscriptionApiService);

  readonly barberShop = signal<BarberShopResponse | null>(null);
  readonly plans = signal<SubscriptionCatalogPlan[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadRenewalInformation();
  }

  reload(): void {
    this.loadRenewalInformation();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }

  private loadRenewalInformation(): void {
    const session = this.sessionService.currentSession;

    this.errorMessage.set('');
    this.plans.set([]);

    if (
      !session ||
      session.role !== 'ADMIN' ||
      !session.barberId ||
      !session.barbershopId
    ) {
      this.loading.set(false);
      this.errorMessage.set(
        'No se encontró una barbería asociada al perfil de administrador autenticado. Vuelve a iniciar sesión para actualizar la información desde el backend.'
      );
      return;
    }

    this.loading.set(true);

    forkJoin({
      barberShop: this.barberShopApi.getById(session.barbershopId),
      plans: this.subscriptionApi.getSubscriptionCatalog()
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: result => {
          if (
            !result.barberShop?.id ||
            result.barberShop.id !== session.barbershopId
          ) {
            this.errorMessage.set(
              'La barbería recibida no coincide con la asociada al perfil autenticado.'
            );
            return;
          }

          this.barberShop.set(result.barberShop);
          this.plans.set(result.plans);
        },
        error: (error: unknown) => {
          console.error('No fue posible cargar datos de renovación:', error);
          this.errorMessage.set(
            'No fue posible consultar la barbería y los planes disponibles. Inténtalo nuevamente.'
          );
        }
      });
  }
}
