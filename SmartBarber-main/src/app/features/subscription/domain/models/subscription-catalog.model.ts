export interface SubscriptionCatalogPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  discount: number;
  createAt?: string;
  updateAt?: string | null;
}
