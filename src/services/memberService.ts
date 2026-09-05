import type { Dependent, Member, Relationship } from '../types/domain';
import { member as seedMember, dependents as seedDependents } from '../data/member';
import { withLatency } from './simulate';
import { initStore, savePersisted } from './persist';

const STORE_KEY = 'dependents';
let store: Dependent[] = initStore(STORE_KEY, seedDependents.map((d) => ({ ...d })));

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
    return withLatency(seedMember);
  },

  getDependents(): Promise<Dependent[]> {
    return withLatency(store);
  },

  /** The policyholder plus current dependents — useful for patient pickers. Reflects live family changes. */
  getCoveredPeople(): Promise<CoveredPerson[]> {
    const people: CoveredPerson[] = [
      { id: seedMember.id, name: seedMember.name, relationship: 'self' },
      ...store.map((d) => ({ id: d.id, name: d.name, relationship: d.relationship })),
    ];
    return withLatency(people);
  },

  addDependent(input: AddDependentInput): Promise<Dependent> {
    const dependent: Dependent = {
      id: `dep_${Date.now()}`,
      name: input.name,
      relationship: input.relationship,
      dateOfBirth: input.dateOfBirth,
      memberId: seedMember.id,
    };
    store = [...store, dependent];
    savePersisted(STORE_KEY, store);
    return withLatency(dependent, 400);
  },

  removeDependent(id: string): Promise<void> {
    store = store.filter((d) => d.id !== id);
    savePersisted(STORE_KEY, store);
    return withLatency(undefined, 300);
  },
};
