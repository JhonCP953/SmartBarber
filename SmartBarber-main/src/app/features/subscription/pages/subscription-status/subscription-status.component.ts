import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    OnInit,
    signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
    GetCurrentSubscriptionUseCase
} from '../../application/use-cases/get-current-subscription.use-case';

import {
    CurrentSubscription,
    SubscriptionStatus
} from '../../domain/models/current-subscription.model';

@Component({
    selector: 'app-subscription-status',

    standalone: true,

    imports: [
        CommonModule,
        RouterLink
    ],

    templateUrl:
        './subscription-status.component.html',

    styleUrl:
        './subscription-status.component.css',

    changeDetection:
        ChangeDetectionStrategy.OnPush
})
export class SubscriptionStatusComponent
    implements OnInit {

    private readonly getCurrentSubscriptionUseCase =
        inject(GetCurrentSubscriptionUseCase);

    readonly currentSubscription =
        signal<CurrentSubscription | null>(null);

    readonly loading =
        signal(false);

    readonly errorMessage =
        signal<string | null>(null);

    readonly daysRemaining =
        computed(() => {

            const subscription =
                this.currentSubscription();

            if (!subscription) {
                return null;
            }

            return this.calculateDaysRemaining(
                subscription.renewalDate
            );

        });

    readonly isExpiringSoon =
        computed(() => {

            const days =
                this.daysRemaining();

            return (
                days !== null &&
                days >= 0 &&
                days <= 7 &&
                this.isActive()
            );

        });

    readonly statusLabel =
        computed(() => {

            const status =
                this.currentSubscription()?.status;

            return status
                ? this.getStatusLabel(status)
                : '';

        });

    readonly statusDescription =
        computed(() => {

            const status =
                this.currentSubscription()?.status;

            switch (status) {

                case 'ACTIVE':
                    return 'La suscripción se encuentra activa.';

                case 'PENDING':
                    return 'La suscripción está pendiente de activación.';

                case 'PAST_DUE':
                    return 'El pago de la suscripción está pendiente o atrasado.';

                case 'PENDING_CANCELLATION':
                    return 'La suscripción está programada para finalizar.';

                case 'CANCELLED':
                    return 'La suscripción se encuentra cancelada.';

                case 'EXPIRED':
                    return 'La suscripción ha vencido.';

                default:
                    return '';

            }

        });

    readonly canRenew =
        computed(() => {

            const status =
                this.currentSubscription()?.status;

            return (
                status === 'ACTIVE' ||
                status === 'PAST_DUE' ||
                status === 'EXPIRED'
            );

        });

    readonly canChangePlan =
        computed(() => {

            const status =
                this.currentSubscription()?.status;

            return status === 'ACTIVE';

        });

    readonly canCancel =
        computed(() => {

            const status =
                this.currentSubscription()?.status;

            return status === 'ACTIVE';

        });

    ngOnInit(): void {

        this.loadSubscription();

    }

    reload(): void {

        this.loadSubscription();

    }

    isActive(): boolean {

        return (
            this.currentSubscription()?.status ===
            'ACTIVE'
        );

    }

    getStatusLabel(
        status: SubscriptionStatus
    ): string {

        switch (status) {

            case 'ACTIVE':
                return 'Activa';

            case 'PENDING':
                return 'Pendiente';

            case 'PAST_DUE':
                return 'Pago pendiente';

            case 'PENDING_CANCELLATION':
                return 'Cancelación programada';

            case 'CANCELLED':
                return 'Cancelada';

            case 'EXPIRED':
                return 'Vencida';

            default:
                return status;

        }

    }

    getStatusClass(
        status: SubscriptionStatus
    ): string {

        switch (status) {

            case 'ACTIVE':
                return 'status-active';

            case 'PENDING':
                return 'status-pending';

            case 'PAST_DUE':
                return 'status-past-due';

            case 'PENDING_CANCELLATION':
                return 'status-pending-cancellation';

            case 'CANCELLED':
                return 'status-cancelled';

            case 'EXPIRED':
                return 'status-expired';

            default:
                return '';

        }

    }

    formatCurrency(
        value: number,
        currency: string
    ): string {

        return new Intl.NumberFormat(
            'es-CO',
            {
                style: 'currency',
                currency,
                maximumFractionDigits: 0
            }
        ).format(value);

    }

    formatDate(
        date: string
    ): string {

        return new Intl.DateTimeFormat(
            'es-CO',
            {
                dateStyle: 'long'
            }
        ).format(
            new Date(date)
        );

    }

    private loadSubscription(): void {

        this.loading.set(true);
        this.errorMessage.set(null);

        this.getCurrentSubscriptionUseCase
            .execute()
            .subscribe({

                next: (subscription) => {

                    this.currentSubscription.set(
                        subscription
                    );

                    this.loading.set(false);

                },

                error: (error: unknown) => {

                    this.loading.set(false);

                    this.errorMessage.set(
                        this.getErrorMessage(error)
                    );

                }

            });

    }

    private calculateDaysRemaining(
        renewalDate: string
    ): number {

        const now =
            new Date();

        const expiration =
            new Date(renewalDate);

        const difference =
            expiration.getTime() -
            now.getTime();

        return Math.max(
            0,
            Math.ceil(
                difference /
                (1000 * 60 * 60 * 24)
            )
        );

    }

    private getErrorMessage(
        error: unknown
    ): string {

        const response =
            error as {
                error?: {
                    code?: string;
                    message?: string;
                };
            };

        switch (
        response.error?.code
        ) {

            case 'SUBSCRIPTION_NOT_FOUND':

                return (
                    'No se encontró una suscripción asociada a la barbería.'
                );

            case 'UNAUTHORIZED':

                return (
                    'No tienes autorización para consultar la suscripción.'
                );

            default:

                return (
                    response.error?.message ??
                    'No fue posible consultar el estado de la suscripción.'
                );

        }

    }

}