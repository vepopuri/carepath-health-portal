import type { PriorAuthorization, PriorAuthStatus } from '../types/domain';
import { priorAuthorizations as seedPriorAuths } from '../data/priorAuths';
import { withLatency } from './simulate';
import { initStore, savePersisted } from './persist';

const STORE_KEY = 'priorAuthorizations';
let store: PriorAuthorization[] = initStore(STORE_KEY, seedPriorAuths.map((p) => ({ ...p })));

export interface PriorAuthFilters {
  status?: PriorAuthStatus;
  patientId?: string;
}

export interface RequestAuthorizationInput {
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  serviceRequested: string;
}

export const priorAuthService = {
  list(filters: PriorAuthFilters = {}): Promise<PriorAuthorization[]> {
    let results = store;
    if (filters.status) results = results.filter((p) => p.status === filters.status);
    if (filters.patientId) results = results.filter((p) => p.patientId === filters.patientId);
    return withLatency(results.sort((a, b) => (a.requestedDate < b.requestedDate ? 1 : -1)));
  },

  getById(id: string): Promise<PriorAuthorization | undefined> {
    return withLatency(store.find((p) => p.id === id));
  },

  /** Demo-mode authorization request. Always lands as "pending" — no real utilization review occurs. */
  requestAuthorization(input: RequestAuthorizationInput): Promise<PriorAuthorization> {
    const request: PriorAuthorization = {
      id: `pa_${Date.now()}`,
      memberId: 'mem_jordan_alvarez',
      patientId: input.patientId,
      patientName: input.patientName,
      providerId: input.providerId,
      providerName: input.providerName,
      serviceRequested: input.serviceRequested,
      requestedDate: new Date().toISOString(),
      decisionDate: null,
      status: 'pending',
      validThrough: null,
      notes: 'Under clinical review. Decisions are typically issued within 5-7 business days.',
    };
    store = [request, ...store];
    savePersisted(STORE_KEY, store);
    return withLatency(request, 500);
  },
};
