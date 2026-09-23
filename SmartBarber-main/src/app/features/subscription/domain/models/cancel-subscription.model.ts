import { SubscriptionPlan } from './subscription-plan.model';
import { SubscriptionStatus } from './current-subscription.model';

export interface CancelSubscriptionRequest {
    subscriptionId: string;
    reason?: string;
    reasonDetail?: string;
}

export interface CancelSubscriptionResponse {
    subscriptionId: string;
    previousPlan: SubscriptionPlan;

    status: SubscriptionStatus;

    cancellationDate: string;
    effectiveDate: string;

    historyRetained: boolean;

    availableFeatures: string[];
    restrictedFeatures: string[];

    message: string;
}