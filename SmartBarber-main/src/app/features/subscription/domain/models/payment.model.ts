export type PaymentStatus =
  | 'PAID'
  | 'PENDING'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

export interface Payment {
  id: string;
  date: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  transactionReference: string;
  description: string;
}