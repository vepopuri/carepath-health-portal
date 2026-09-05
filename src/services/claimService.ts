import type { Claim, ClaimStatus } from '../types/domain';
import { claims as seedClaims } from '../data/claims';
import { withLatency } from './simulate';
import { initStore, savePersisted } from './persist';

const STORE_KEY = 'claims';
let store: Claim[] = initStore(STORE_KEY, seedClaims.map((c) => ({ ...c })));

export interface ClaimFilters {
  status?: ClaimStatus;
  patientId?: string;
  search?: string;
}

function matches(c: Claim, filters: ClaimFilters): boolean {
  if (filters.status && c.status !== filters.status) return false;
  if (filters.patientId && c.patientId !== filters.patientId) return false;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    if (!`${c.claimNumber} ${c.serviceType} ${c.providerName} ${c.patientName}`.toLowerCase().includes(q)) return false;
  }
  return true;
}

export interface FileClaimInput {
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  serviceDate: string;
  serviceType: string;
}

export const claimService = {
  list(filters: ClaimFilters = {}): Promise<Claim[]> {
    return withLatency(
      store.filter((c) => matches(c, filters)).sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1)),
    );
  },

  getById(id: string): Promise<Claim | undefined> {
    return withLatency(store.find((c) => c.id === id));
  },

  /** Demo-mode claim filing. Appends a new "submitted" claim; no real insurer is contacted. */
  fileClaim(input: FileClaimInput): Promise<Claim> {
    const now = new Date().toISOString();
    const claim: Claim = {
      id: `clm_${Date.now()}`,
      claimNumber: `CLM-2026-${Math.floor(10000 + Math.random() * 89999)}`,
      memberId: 'mem_jordan_alvarez',
      patientId: input.patientId,
      patientName: input.patientName,
      providerId: input.providerId,
      providerName: input.providerName,
      serviceDate: input.serviceDate,
      submittedDate: now,
      processedDate: null,
      status: 'submitted',
      serviceType: input.serviceType,
      diagnosisSummary: 'Pending clinical review.',
      billedAmount: 0,
      allowedAmount: 0,
      planPaid: 0,
      deductibleApplied: 0,
      copayApplied: 0,
      coinsuranceApplied: 0,
      memberResponsibility: 0,
      denialReason: null,
      eobAvailable: false,
    };
    store = [claim, ...store];
    savePersisted(STORE_KEY, store);
    return withLatency(claim, 500);
  },
};
