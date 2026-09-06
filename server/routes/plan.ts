import { Router } from 'express';
import { db } from '../db.js';
import type { Plan } from '../../src/types/domain.js';

export const planRouter = Router();

planRouter.get('/plan', (_req, res) => {
  const row = db.prepare('SELECT * FROM plans LIMIT 1').get() as (Omit<Plan, 'coverage'> & { coverage: string }) | undefined;
  if (!row) {
    res.status(404).json({ error: 'Plan not found' });
    return;
  }
  const plan: Plan = { ...row, coverage: JSON.parse(row.coverage) };
  res.json(plan);
});
