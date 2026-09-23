import { SubscriptionPlan } from './subscription-plan.model';

//Estado de la suscripción y cual tiene

export type SubscriptionStatus =
    | 'ACTIVE'
    | 'PENDING'
    | 'PAST_DUE' // pago vencido o atrasado
    | 'CANCELLED'
    | 'EXPIRED'
    | 'PENDING_CANCELLATION';

export interface CurrentSubscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  renewalDate: string;

  /**
   * Indica si la barbería debe proporcionar obligatoriamente un motivo al cancelar.
   */
  cancellationReasonRequired?: boolean;

  /**
   * Fecha en la que terminaría la suscripción si existe una cancelación programada.
   */
  cancellationEffectiveDate?: string;
}