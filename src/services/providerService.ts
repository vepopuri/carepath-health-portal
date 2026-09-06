import type { Provider, ProviderNetwork } from '../types/domain';
import { api } from './api';

export interface ProviderFilters {
  search?: string;
  specialty?: string;
  network?: ProviderNetwork;
  telehealthOnly?: boolean;
  acceptingNewPatientsOnly?: boolean;
}

function toQueryString(filters: ProviderFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.specialty) params.set('specialty', filters.specialty);
  if (filters.network) params.set('network', filters.network);
  if (filters.telehealthOnly) params.set('telehealthOnly', 'true');
  if (filters.acceptingNewPatientsOnly) params.set('acceptingNewPatientsOnly', 'true');
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const providerService = {
  list(filters: ProviderFilters = {}): Promise<Provider[]> {
    return api.get(`/providers${toQueryString(filters)}`);
  },

  getById(id: string): Promise<Provider | undefined> {
    return api.get<Provider>(`/providers/${id}`).catch(() => undefined);
  },
};
