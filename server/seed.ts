import { db } from './db.js';
import {
  seedMember,
  seedDependents,
  seedPlan,
  seedProviders,
  seedClaims,
  seedPriorAuthorizations,
  seedPayments,
  seedDocuments,
} from './seedData.js';

function isEmpty(table: string): boolean {
  const row = db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as { count: number };
  return row.count === 0;
}

export function seedDatabaseIfEmpty(): void {
  if (isEmpty('members')) {
    db.prepare(
      `INSERT INTO members (id, name, memberNumber, email, phone, dateOfBirth, address, planId)
       VALUES (@id, @name, @memberNumber, @email, @phone, @dateOfBirth, @address, @planId)`,
    ).run(seedMember);
  }

  if (isEmpty('dependents')) {
    const insert = db.prepare(
      `INSERT INTO dependents (id, name, relationship, dateOfBirth, memberId)
       VALUES (@id, @name, @relationship, @dateOfBirth, @memberId)`,
    );
    for (const d of seedDependents) insert.run(d);
  }

  if (isEmpty('plans')) {
    db.prepare(
      `INSERT INTO plans (
         id, name, type, tier, groupNumber, effectiveDate, renewalDate, premiumMonthly,
         deductibleIndividual, deductibleFamily, deductibleMetIndividual, deductibleMetFamily,
         outOfPocketMaxIndividual, outOfPocketMaxFamily, outOfPocketMetIndividual, outOfPocketMetFamily,
         planDocumentUrl, coverage
       ) VALUES (
         @id, @name, @type, @tier, @groupNumber, @effectiveDate, @renewalDate, @premiumMonthly,
         @deductibleIndividual, @deductibleFamily, @deductibleMetIndividual, @deductibleMetFamily,
         @outOfPocketMaxIndividual, @outOfPocketMaxFamily, @outOfPocketMetIndividual, @outOfPocketMetFamily,
         @planDocumentUrl, @coverage
       )`,
    ).run({ ...seedPlan, coverage: JSON.stringify(seedPlan.coverage) });
  }

  if (isEmpty('providers')) {
    const insert = db.prepare(
      `INSERT INTO providers (
         id, name, specialty, credentials, network, address, city, state, zip, phone,
         distanceMiles, rating, acceptingNewPatients, telehealth, languages, bio
       ) VALUES (
         @id, @name, @specialty, @credentials, @network, @address, @city, @state, @zip, @phone,
         @distanceMiles, @rating, @acceptingNewPatients, @telehealth, @languages, @bio
       )`,
    );
    for (const p of seedProviders) {
      insert.run({
        ...p,
        acceptingNewPatients: p.acceptingNewPatients ? 1 : 0,
        telehealth: p.telehealth ? 1 : 0,
        languages: JSON.stringify(p.languages),
      });
    }
  }

  if (isEmpty('claims')) {
    const insert = db.prepare(
      `INSERT INTO claims (
         id, claimNumber, memberId, patientId, patientName, providerId, providerName,
         serviceDate, submittedDate, processedDate, status, serviceType, diagnosisSummary,
         billedAmount, allowedAmount, planPaid, deductibleApplied, copayApplied, coinsuranceApplied,
         memberResponsibility, denialReason, eobAvailable
       ) VALUES (
         @id, @claimNumber, @memberId, @patientId, @patientName, @providerId, @providerName,
         @serviceDate, @submittedDate, @processedDate, @status, @serviceType, @diagnosisSummary,
         @billedAmount, @allowedAmount, @planPaid, @deductibleApplied, @copayApplied, @coinsuranceApplied,
         @memberResponsibility, @denialReason, @eobAvailable
       )`,
    );
    for (const c of seedClaims) insert.run({ ...c, eobAvailable: c.eobAvailable ? 1 : 0 });
  }

  if (isEmpty('priorAuthorizations')) {
    const insert = db.prepare(
      `INSERT INTO priorAuthorizations (
         id, memberId, patientId, patientName, providerId, providerName, serviceRequested,
         requestedDate, decisionDate, status, validThrough, notes
       ) VALUES (
         @id, @memberId, @patientId, @patientName, @providerId, @providerName, @serviceRequested,
         @requestedDate, @decisionDate, @status, @validThrough, @notes
       )`,
    );
    for (const pa of seedPriorAuthorizations) insert.run(pa);
  }

  if (isEmpty('payments')) {
    const insert = db.prepare(
      `INSERT INTO payments (id, memberId, periodLabel, amount, dueDate, paidDate, status, method, invoiceNumber)
       VALUES (@id, @memberId, @periodLabel, @amount, @dueDate, @paidDate, @status, @method, @invoiceNumber)`,
    );
    for (const p of seedPayments) insert.run(p);
  }

  if (isEmpty('documents')) {
    const insert = db.prepare(
      `INSERT INTO documents (id, memberId, category, title, date, description, relatedClaimId)
       VALUES (@id, @memberId, @category, @title, @date, @description, @relatedClaimId)`,
    );
    for (const d of seedDocuments) insert.run(d);
  }
}
