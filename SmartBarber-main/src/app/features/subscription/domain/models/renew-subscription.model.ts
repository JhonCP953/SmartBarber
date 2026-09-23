import { CurrentSubscription } from './current-subscription.model';

export type RenewalProcessStatus =
  | 'IDLE'
  | 'PROCESSING'
  | 'REDIRECTING'
  | 'SUCCESS'
  | 'ERROR';

export interface RenewSubscriptionRequest {
  subscriptionId: string;
  returnUrl: string;
}

export interface RenewSubscriptionResponse {
  subscriptionId: string;
  paymentUrl: string;
  paymentReference?: string;
  status: 'PENDING_PAYMENT' | 'RENEWED';
  subscription?: CurrentSubscription;
  message: string;
}