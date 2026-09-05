import type { Dependent, Member } from '../types/domain';

export const member: Member = {
  id: 'mem_jordan_alvarez',
  name: 'Jordan Alvarez',
  memberNumber: 'CP-88213045',
  email: 'jordan.alvarez@example.com',
  phone: '(555) 214-7788',
  dateOfBirth: '1988-04-12',
  address: '412 Willowbrook Lane, Springfield, CO 80112',
  planId: 'plan_gold_ppo_2026',
};

export const dependents: Dependent[] = [
  {
    id: 'dep_rowan_alvarez',
    name: 'Rowan Alvarez',
    relationship: 'spouse',
    dateOfBirth: '1990-11-02',
    memberId: 'mem_jordan_alvarez',
  },
  {
    id: 'dep_mila_alvarez',
    name: 'Mila Alvarez',
    relationship: 'child',
    dateOfBirth: '2017-06-23',
    memberId: 'mem_jordan_alvarez',
  },
];

/** All covered people (the member plus their dependents) — useful for patient pickers. */
export const coveredPeople = [
  { id: member.id, name: member.name, relationship: 'self' as const },
  ...dependents.map((d) => ({ id: d.id, name: d.name, relationship: d.relationship })),
];
