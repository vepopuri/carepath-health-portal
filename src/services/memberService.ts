import type { Dependent, Member, Relationship } from '../types/domain';
import { api } from './api';

export interface AddDependentInput {
  name: string;
  relationship: Relationship;
  dateOfBirth: string;
}

export interface CoveredPerson {
  id: string;
  name: string;
  relationship: Relationship;
}

export const memberService = {
  getMember(): Promise<Member> {
    return api.get('/member');
  },

  getDependents(): Promise<Dependent[]> {
    return api.get('/dependents');
  },

  /** The policyholder plus current dependents — useful for patient pickers. Reflects live family changes. */
  getCoveredPeople(): Promise<CoveredPerson[]> {
    return api.get('/covered-people');
  },

  addDependent(input: AddDependentInput): Promise<Dependent> {
    return api.post('/dependents', input);
  },

  removeDependent(id: string): Promise<void> {
    return api.delete(`/dependents/${id}`);
  },
};
