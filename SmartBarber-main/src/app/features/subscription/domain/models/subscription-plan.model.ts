export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'MONTHLY' | 'YEARLY';
  features: string[];
  active: boolean;
}