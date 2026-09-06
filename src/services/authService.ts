import type { Member } from '../types/domain';
import { api } from './api';

export const authService = {
  me(): Promise<Member> {
    return api.get('/auth/me');
  },

  login(email: string, password: string): Promise<Member> {
    return api.post('/auth/login', { email, password });
  },

  logout(): Promise<void> {
    return api.post('/auth/logout');
  },
};
