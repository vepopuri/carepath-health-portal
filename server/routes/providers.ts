import { Router } from 'express';
import { db } from '../db.js';
import type { Provider, ProviderNetwork } from '../../src/types/domain.js';

export const providersRouter = Router();

type ProviderRow = Omit<Provider, 'languages' | 'acceptingNewPatients' | 'telehealth'> & {
  languages: string;
  acceptingNewPatients: number;
  telehealth: number;
};

function toProvider(row: ProviderRow): Provider {
  return {
    ...row,
    languages: JSON.parse(row.languages),
    acceptingNewPatients: Boolean(row.acceptingNewPatients),
    telehealth: Boolean(row.telehealth),
  };
}

function matches(p: Provider, filters: { search?: string; specialty?: string; network?: ProviderNetwork; telehealthOnly?: boolean; acceptingNewPatientsOnly?: boolean }): boolean {
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

providersRouter.get('/providers', (req, res) => {
  const rows = db.prepare('SELECT * FROM providers').all() as ProviderRow[];
  const providers = rows.map(toProvider);
  const filters = {
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
    specialty: typeof req.query.specialty === 'string' ? req.query.specialty : undefined,
    network: typeof req.query.network === 'string' ? (req.query.network as ProviderNetwork) : undefined,
    telehealthOnly: req.query.telehealthOnly === 'true',
    acceptingNewPatientsOnly: req.query.acceptingNewPatientsOnly === 'true',
  };
  res.json(providers.filter((p) => matches(p, filters)));
});

providersRouter.get('/providers/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM providers WHERE id = ?').get(req.params.id) as ProviderRow | undefined;
  if (!row) {
    res.status(404).json({ error: 'Provider not found' });
    return;
  }
  res.json(toProvider(row));
});
