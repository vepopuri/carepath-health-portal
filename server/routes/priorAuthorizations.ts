import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import type { PriorAuthorization, PriorAuthStatus } from '../../src/types/domain.js';

export const priorAuthorizationsRouter = Router();

function matches(p: PriorAuthorization, filters: { status?: PriorAuthStatus; patientId?: string }): boolean {
  if (filters.status && p.status !== filters.status) return false;
  if (filters.patientId && p.patientId !== filters.patientId) return false;
  return true;
}

priorAuthorizationsRouter.get('/prior-authorizations', (req, res) => {
  const rows = db.prepare('SELECT * FROM priorAuthorizations').all() as PriorAuthorization[];
  const filters = {
    status: typeof req.query.status === 'string' ? (req.query.status as PriorAuthStatus) : undefined,
    patientId: typeof req.query.patientId === 'string' ? req.query.patientId : undefined,
  };
  const result = rows.filter((p) => matches(p, filters)).sort((a, b) => (a.requestedDate < b.requestedDate ? 1 : -1));
  res.json(result);
});

priorAuthorizationsRouter.get('/prior-authorizations/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM priorAuthorizations WHERE id = ?').get(req.params.id) as PriorAuthorization | undefined;
  if (!row) {
    res.status(404).json({ error: 'Prior authorization not found' });
    return;
  }
  res.json(row);
});

interface RequestAuthorizationInput {
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  serviceRequested: string;
}

priorAuthorizationsRouter.post('/prior-authorizations', (req, res) => {
  const input = req.body as Partial<RequestAuthorizationInput>;
  if (!input.patientId || !input.patientName || !input.providerId || !input.providerName || !input.serviceRequested) {
    res.status(400).json({ error: 'patientId, patientName, providerId, providerName, and serviceRequested are required' });
    return;
  }
  const member = db.prepare('SELECT id FROM members LIMIT 1').get() as { id: string };
  const request: PriorAuthorization = {
    id: `pa_${randomUUID()}`,
    memberId: member.id,
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
  db.prepare(
    `INSERT INTO priorAuthorizations (
       id, memberId, patientId, patientName, providerId, providerName, serviceRequested,
       requestedDate, decisionDate, status, validThrough, notes
     ) VALUES (
       @id, @memberId, @patientId, @patientName, @providerId, @providerName, @serviceRequested,
       @requestedDate, @decisionDate, @status, @validThrough, @notes
     )`,
  ).run(request);
  res.status(201).json(request);
});
