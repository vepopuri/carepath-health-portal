import type { Plan } from '../types/domain';
import { api } from './api';

export const planService = {
  getPlan(): Promise<Plan> {
    return api.get('/plan');
  },
};
