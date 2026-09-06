import type { Claim, ClaimStatus } from '../types/domain';
import { api } from './api';

export interface ClaimFilters {
  status?: ClaimStatus;
  patientId?: string;
  search?: string;
}

export interface FileClaimInput {
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  serviceDate: string;
  serviceType: string;
}

function toQueryString(filters: ClaimFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.patientId) params.set('patientId', filters.patientId);
  if (filters.search) params.set('search', filters.search);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const claimService = {
  list(filters: ClaimFilters = {}): Promise<Claim[]> {
    return api.get(`/claims${toQueryString(filters)}`);
  },

  getById(id: string): Promise<Claim | undefined> {
    return api.get<Claim>(`/claims/${id}`).catch(() => undefined);
  },

  /** Demo-mode claim filing. Creates a new "submitted" claim; no real insurer is contacted. */
  fileClaim(input: FileClaimInput): Promise<Claim> {
    return api.post('/claims', input);
  },
};
