import type { Payment } from '../types/domain';
import { payments as seedPayments } from '../data/payments';
import { withLatency } from './simulate';
import { initStore, savePersisted } from './persist';

const STORE_KEY = 'payments';
let store: Payment[] = initStore(STORE_KEY, seedPayments.map((p) => ({ ...p })));

export const paymentService = {
  list(): Promise<Payment[]> {
    return withLatency(store.slice().sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1)));
  },

  /** Demo-mode payment. Marks a scheduled/pending payment as paid; no real charge occurs. */
  payNow(id: string): Promise<Payment | undefined> {
    store = store.map((p) => (p.id === id ? { ...p, status: 'paid', paidDate: new Date().toISOString() } : p));
    savePersisted(STORE_KEY, store);
    return withLatency(store.find((p) => p.id === id), 500);
  },
};
