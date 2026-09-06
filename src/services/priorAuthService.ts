import type { PriorAuthorization, PriorAuthStatus } from '../types/domain';
import { api } from './api';

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

function toQueryString(filters: PriorAuthFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.patientId) params.set('patientId', filters.patientId);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const priorAuthService = {
  list(filters: PriorAuthFilters = {}): Promise<PriorAuthorization[]> {
    return api.get(`/prior-authorizations${toQueryString(filters)}`);
  },

  getById(id: string): Promise<PriorAuthorization | undefined> {
    return api.get<PriorAuthorization>(`/prior-authorizations/${id}`).catch(() => undefined);
  },

  /** Demo-mode authorization request. Always lands as "pending" — no real utilization review occurs. */
  requestAuthorization(input: RequestAuthorizationInput): Promise<PriorAuthorization> {
    return api.post('/prior-authorizations', input);
  },
};
