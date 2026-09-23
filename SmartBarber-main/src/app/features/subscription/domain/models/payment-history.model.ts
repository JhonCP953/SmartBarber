import {
  Payment,
  PaymentStatus
} from './payment.model';

export interface PaymentHistoryFilters {
  page: number;
  size: number;
  status?: PaymentStatus;
  fromDate?: string;
  toDate?: string;
}

export interface PaymentHistory {
  content: Payment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}