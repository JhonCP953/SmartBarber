import { SubscriptionPlan } from './subscription-plan.model';

export interface ChangePlanRequest {
  subscriptionId: string;
  newPlanId: string;
}

export interface ChangePlanResponse {
  subscriptionId: string;
  previousPlan: SubscriptionPlan;
  newPlan: SubscriptionPlan;
  effectiveDate: string;
  nextBillingDate: string; //proximo cobro ej: "Próximo cobro: 12 de octubre de 2026"
  message: string;
}