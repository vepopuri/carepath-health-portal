import type { Dependent, Member } from '../types/domain';
import { member as seedMember, dependents as seedDependents } from '../data/member';
import { withLatency } from './simulate';

export const memberService = {
  getMember(): Promise<Member> {
    return withLatency(seedMember);
  },

  getDependents(): Promise<Dependent[]> {
    return withLatency(seedDependents);
  },
};
