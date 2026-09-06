import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { db } from './db.js';
import type { Member } from '../src/types/domain.js';

export const SESSION_COOKIE = 'carepath_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const KEY_LENGTH = 64;

export type MemberRow = Member & { passwordHash: string | null };

/** Strips the password hash before a member row ever reaches a JSON response. */
export function toPublicMember(row: MemberRow): Member {
  return {
    id: row.id,
    name: row.name,
    memberNumber: row.memberNumber,
    email: row.email,
    phone: row.phone,
    dateOfBirth: row.dateOfBirth,
    address: row.address,
    planId: row.planId,
  };
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, 'hex');
  const candidateBuffer = scryptSync(password, salt, KEY_LENGTH);
  if (hashBuffer.length !== candidateBuffer.length) return false;
  return timingSafeEqual(hashBuffer, candidateBuffer);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

export function createSession(memberId: string): { token: string; expiresAt: Date } {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  db.prepare('INSERT INTO sessions (token, memberId, expiresAt) VALUES (?, ?, ?)').run(token, memberId, expiresAt.toISOString());
  return { token, expiresAt };
}

export function destroySession(token: string): void {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

/** Resolves a session cookie to a member id, evicting it first if it has expired. */
export function getSessionMemberId(token: string | undefined): string | null {
  if (!token) return null;
  const session = db.prepare('SELECT memberId, expiresAt FROM sessions WHERE token = ?').get(token) as
    | { memberId: string; expiresAt: string }
    | undefined;
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }
  return session.memberId;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = (req.cookies as Record<string, string> | undefined)?.[SESSION_COOKIE];
  if (!getSessionMemberId(token)) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  next();
}
