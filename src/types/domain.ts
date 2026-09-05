export type Relationship = 'self' | 'spouse' | 'child' | 'other';

export interface Dependent {
  id: string;
  name: string;
  relationship: Relationship;
  dateOfBirth: string;
  memberId: string;
}

export interface Member {
  id: string;
  name: string;
  memberNumber: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  planId: string;
}

export type PlanType = 'HMO' | 'PPO' | 'EPO' | 'HDHP';
export type PlanTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface CoverageItem {
  id: string;
  category: string;
  serviceName: string;
  costShare: string;
  priorAuthRequired: boolean;
}

export interface Plan {
  id: string;
  name: string;
  type: PlanType;
  tier: PlanTier;
  groupNumber: string;
  effectiveDate: string;
  renewalDate: string;
  premiumMonthly: number;
  deductibleIndividual: number;
  deductibleFamily: number;
  deductibleMetIndividual: number;
  deductibleMetFamily: number;
  outOfPocketMaxIndividual: number;
  outOfPocketMaxFamily: number;
  outOfPocketMetIndividual: number;
  outOfPocketMetFamily: number;
  coverage: CoverageItem[];
  planDocumentUrl: string;
}

export type ProviderNetwork = 'in_network' | 'out_of_network';

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  credentials: string;
  network: ProviderNetwork;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  distanceMiles: number;
  rating: number;
  acceptingNewPatients: boolean;
  telehealth: boolean;
  languages: string[];
  bio: string;
}

export type ClaimStatus = 'submitted' | 'in_review' | 'approved' | 'denied' | 'paid';

export interface Claim {
  id: string;
  claimNumber: string;
  memberId: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  serviceDate: string;
  submittedDate: string;
  processedDate: string | null;
  status: ClaimStatus;
  serviceType: string;
  diagnosisSummary: string;
  billedAmount: number;
  allowedAmount: number;
  planPaid: number;
  deductibleApplied: number;
  copayApplied: number;
  coinsuranceApplied: number;
  memberResponsibility: number;
  denialReason: string | null;
  eobAvailable: boolean;
}

export type PriorAuthStatus = 'pending' | 'approved' | 'denied' | 'expired';

export interface PriorAuthorization {
  id: string;
  memberId: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  serviceRequested: string;
  requestedDate: string;
  decisionDate: string | null;
  status: PriorAuthStatus;
  validThrough: string | null;
  notes: string;
}

export type PaymentStatus = 'paid' | 'scheduled' | 'failed' | 'pending';

export interface Payment {
  id: string;
  memberId: string;
  periodLabel: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: PaymentStatus;
  method: string;
  invoiceNumber: string;
}

export type DocumentCategory = 'id_card' | 'eob' | 'plan_document' | 'tax_form' | 'other';

export interface PortalDocument {
  id: string;
  memberId: string;
  category: DocumentCategory;
  title: string;
  date: string;
  description: string;
  relatedClaimId: string | null;
}
