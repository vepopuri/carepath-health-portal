import type { Plan } from '../types/domain';
import { plan as seedPlan } from '../data/plan';
import { withLatency } from './simulate';

export const planService = {
  getPlan(): Promise<Plan> {
    return withLatency(seedPlan);
  },
};
