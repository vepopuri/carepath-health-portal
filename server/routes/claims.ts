import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import type { Claim, ClaimStatus } from '../../src/types/domain.js';

export const claimsRouter = Router();

type ClaimRow = Omit<Claim, 'eobAvailable'> & { eobAvailable: number };

function toClaim(row: ClaimRow): Claim {
  return { ...row, eobAvailable: Boolean(row.eobAvailable) };
}

function matches(c: Claim, filters: { status?: ClaimStatus; patientId?: string; search?: string }): boolean {
  if (filters.status && c.status !== filters.status) return false;
  if (filters.patientId && c.patientId !== filters.patientId) return false;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    if (!`${c.claimNumber} ${c.serviceType} ${c.providerName} ${c.patientName}`.toLowerCase().includes(q)) return false;
  }
  return true;
}

claimsRouter.get('/claims', (req, res) => {
  const rows = db.prepare('SELECT * FROM claims').all() as ClaimRow[];
  const claims = rows.map(toClaim);
  const filters = {
    status: typeof req.query.status === 'string' ? (req.query.status as ClaimStatus) : undefined,
    patientId: typeof req.query.patientId === 'string' ? req.query.patientId : undefined,
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
  };
  const result = claims.filter((c) => matches(c, filters)).sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1));
  res.json(result);
});

claimsRouter.get('/claims/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM claims WHERE id = ?').get(req.params.id) as ClaimRow | undefined;
  if (!row) {
    res.status(404).json({ error: 'Claim not found' });
    return;
  }
  res.json(toClaim(row));
});

interface FileClaimInput {
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  serviceDate: string;
  serviceType: string;
}

claimsRouter.post('/claims', (req, res) => {
  const input = req.body as Partial<FileClaimInput>;
  if (!input.patientId || !input.patientName || !input.providerId || !input.providerName || !input.serviceDate || !input.serviceType) {
    res.status(400).json({ error: 'patientId, patientName, providerId, providerName, serviceDate, and serviceType are required' });
    return;
  }
  const member = db.prepare('SELECT id FROM members LIMIT 1').get() as { id: string };
  const now = new Date().toISOString();
  const claim: Claim = {
    id: `clm_${randomUUID()}`,
    claimNumber: `CLM-2026-${Math.floor(10000 + Math.random() * 89999)}`,
    memberId: member.id,
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
  db.prepare(
    `INSERT INTO claims (
       id, claimNumber, memberId, patientId, patientName, providerId, providerName,
       serviceDate, submittedDate, processedDate, status, serviceType, diagnosisSummary,
       billedAmount, allowedAmount, planPaid, deductibleApplied, copayApplied, coinsuranceApplied,
       memberResponsibility, denialReason, eobAvailable
     ) VALUES (
       @id, @claimNumber, @memberId, @patientId, @patientName, @providerId, @providerName,
       @serviceDate, @submittedDate, @processedDate, @status, @serviceType, @diagnosisSummary,
       @billedAmount, @allowedAmount, @planPaid, @deductibleApplied, @copayApplied, @coinsuranceApplied,
       @memberResponsibility, @denialReason, @eobAvailable
     )`,
  ).run({ ...claim, eobAvailable: 0 });
  res.status(201).json(claim);
});
