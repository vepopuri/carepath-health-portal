import type { Payment } from '../types/domain';
import { api } from './api';

export const paymentService = {
  list(): Promise<Payment[]> {
    return api.get('/payments');
  },

  /** Demo-mode payment. Marks a scheduled/pending payment as paid; no real charge occurs. */
  payNow(id: string): Promise<Payment | undefined> {
    return api.post<Payment>(`/payments/${id}/pay`).catch(() => undefined);
  },
};
