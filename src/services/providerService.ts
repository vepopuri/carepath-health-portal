import type { Provider, ProviderNetwork } from '../types/domain';
import { providers as seedProviders } from '../data/providers';
import { withLatency } from './simulate';

export interface ProviderFilters {
  search?: string;
  specialty?: string;
  network?: ProviderNetwork;
  telehealthOnly?: boolean;
  acceptingNewPatientsOnly?: boolean;
}

function matches(p: Provider, filters: ProviderFilters): boolean {
  if (filters.search) {
    const q = filters.search.toLowerCase();
    if (!`${p.name} ${p.specialty} ${p.city}`.toLowerCase().includes(q)) return false;
  }
  if (filters.specialty && p.specialty !== filters.specialty) return false;
  if (filters.network && p.network !== filters.network) return false;
  if (filters.telehealthOnly && !p.telehealth) return false;
  if (filters.acceptingNewPatientsOnly && !p.acceptingNewPatients) return false;
  return true;
}

export const providerService = {
  list(filters: ProviderFilters = {}): Promise<Provider[]> {
    return withLatency(seedProviders.filter((p) => matches(p, filters)));
  },

  getById(id: string): Promise<Provider | undefined> {
    return withLatency(seedProviders.find((p) => p.id === id));
  },
};
