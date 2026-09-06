import { Router } from 'express';
import { db } from '../db.js';
import type { PortalDocument } from '../../src/types/domain.js';

export const documentsRouter = Router();

documentsRouter.get('/documents', (_req, res) => {
  const rows = db.prepare('SELECT * FROM documents').all() as PortalDocument[];
  res.json(rows.sort((a, b) => (a.date < b.date ? 1 : -1)));
});

documentsRouter.get('/documents/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id) as PortalDocument | undefined;
  if (!row) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }
  res.json(row);
});
