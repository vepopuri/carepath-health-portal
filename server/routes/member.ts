import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import type { Dependent, Member, Relationship } from '../../src/types/domain.js';

export const memberRouter = Router();

function getMember(): Member {
  return db.prepare('SELECT * FROM members LIMIT 1').get() as Member;
}

function listDependents(memberId: string): Dependent[] {
  return db.prepare('SELECT * FROM dependents WHERE memberId = ?').all(memberId) as Dependent[];
}

memberRouter.get('/member', (_req, res) => {
  res.json(getMember());
});

memberRouter.get('/dependents', (_req, res) => {
  const member = getMember();
  res.json(listDependents(member.id));
});

memberRouter.get('/covered-people', (_req, res) => {
  const member = getMember();
  const dependents = listDependents(member.id);
  res.json([
    { id: member.id, name: member.name, relationship: 'self' },
    ...dependents.map((d) => ({ id: d.id, name: d.name, relationship: d.relationship })),
  ]);
});

memberRouter.post('/dependents', (req, res) => {
  const { name, relationship, dateOfBirth } = req.body as { name?: string; relationship?: Relationship; dateOfBirth?: string };
  if (!name?.trim() || !relationship || !dateOfBirth) {
    res.status(400).json({ error: 'name, relationship, and dateOfBirth are required' });
    return;
  }
  const member = getMember();
  const dependent: Dependent = {
    id: `dep_${randomUUID()}`,
    name: name.trim(),
    relationship,
    dateOfBirth,
    memberId: member.id,
  };
  db.prepare(
    'INSERT INTO dependents (id, name, relationship, dateOfBirth, memberId) VALUES (@id, @name, @relationship, @dateOfBirth, @memberId)',
  ).run(dependent);
  res.status(201).json(dependent);
});

memberRouter.delete('/dependents/:id', (req, res) => {
  db.prepare('DELETE FROM dependents WHERE id = ?').run(req.params.id);
  res.status(204).end();
});
