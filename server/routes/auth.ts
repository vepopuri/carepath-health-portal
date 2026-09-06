import { Router } from 'express';
import { db } from '../db.js';
import {
  SESSION_COOKIE,
  createSession,
  destroySession,
  getSessionMemberId,
  sessionCookieOptions,
  toPublicMember,
  verifyPassword,
  type MemberRow,
} from '../auth.js';

export const authRouter = Router();

authRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }
  const member = db.prepare('SELECT * FROM members WHERE email = ?').get(email) as MemberRow | undefined;
  if (!member?.passwordHash || !verifyPassword(password, member.passwordHash)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  const { token, expiresAt } = createSession(member.id);
  res.cookie(SESSION_COOKIE, token, { ...sessionCookieOptions, expires: expiresAt });
  res.json(toPublicMember(member));
});

authRouter.post('/auth/logout', (req, res) => {
  const token = (req.cookies as Record<string, string> | undefined)?.[SESSION_COOKIE];
  if (token) destroySession(token);
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions);
  res.status(204).end();
});

authRouter.get('/auth/me', (req, res) => {
  const token = (req.cookies as Record<string, string> | undefined)?.[SESSION_COOKIE];
  const memberId = getSessionMemberId(token);
  if (!memberId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId) as MemberRow | undefined;
  if (!member) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.json(toPublicMember(member));
});
