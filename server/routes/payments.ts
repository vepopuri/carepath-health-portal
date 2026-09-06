import { Router } from 'express';
import { db } from '../db.js';
import type { Payment } from '../../src/types/domain.js';

export const paymentsRouter = Router();

paymentsRouter.get('/payments', (_req, res) => {
  const rows = db.prepare('SELECT * FROM payments').all() as Payment[];
  res.json(rows.sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1)));
});

paymentsRouter.post('/payments/:id/pay', (req, res) => {
  const existing = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id) as Payment | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Payment not found' });
    return;
  }
  const paidDate = new Date().toISOString();
  db.prepare('UPDATE payments SET status = ?, paidDate = ? WHERE id = ?').run('paid', paidDate, req.params.id);
  res.json({ ...existing, status: 'paid', paidDate });
});
