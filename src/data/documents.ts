import type { PortalDocument } from '../types/domain';
import { daysAgo } from './mockHelpers';

export const documents: PortalDocument[] = [
  {
    id: 'doc_plan_document',
    memberId: 'mem_jordan_alvarez',
    category: 'plan_document',
    title: 'Summary of Benefits and Coverage (SBC)',
    date: '2026-01-01T00:00:00.000Z',
    description: 'Full plan document for CarePath Gold PPO, effective January 1, 2026.',
    relatedClaimId: null,
  },
  {
    id: 'doc_id_card',
    memberId: 'mem_jordan_alvarez',
    category: 'id_card',
    title: 'CarePath Member ID Card',
    date: '2026-01-01T00:00:00.000Z',
    description: 'Digital ID card for Jordan Alvarez and covered dependents.',
    relatedClaimId: null,
  },
  {
    id: 'doc_eob_1',
    memberId: 'mem_jordan_alvarez',
    category: 'eob',
    title: 'EOB — Annual physical (Priya Kapoor, MD)',
    date: daysAgo(33),
    description: 'Explanation of benefits for claim CLM-2026-01184.',
    relatedClaimId: 'clm_1',
  },
  {
    id: 'doc_eob_3',
    memberId: 'mem_jordan_alvarez',
    category: 'eob',
    title: 'EOB — Cardiology consult (Marcus Webb, MD)',
    date: daysAgo(21),
    description: 'Explanation of benefits for claim CLM-2026-01245.',
    relatedClaimId: 'clm_3',
  },
  {
    id: 'doc_eob_7',
    memberId: 'mem_jordan_alvarez',
    category: 'eob',
    title: 'EOB — Urgent care visit (Mila Alvarez)',
    date: daysAgo(6),
    description: 'Explanation of benefits for claim CLM-2026-01356.',
    relatedClaimId: 'clm_7',
  },
  {
    id: 'doc_tax_1095b',
    memberId: 'mem_jordan_alvarez',
    category: 'tax_form',
    title: '2025 Form 1095-B',
    date: '2026-01-25T00:00:00.000Z',
    description: 'Health coverage tax form for the 2025 plan year.',
    relatedClaimId: null,
  },
];
