import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.CAREPATH_DB_PATH ?? path.join(__dirname, 'carepath.db');

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    memberNumber TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    dateOfBirth TEXT NOT NULL,
    address TEXT NOT NULL,
    planId TEXT NOT NULL,
    passwordHash TEXT
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    memberId TEXT NOT NULL REFERENCES members(id),
    expiresAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS dependents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    dateOfBirth TEXT NOT NULL,
    memberId TEXT NOT NULL REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    tier TEXT NOT NULL,
    groupNumber TEXT NOT NULL,
    effectiveDate TEXT NOT NULL,
    renewalDate TEXT NOT NULL,
    premiumMonthly REAL NOT NULL,
    deductibleIndividual REAL NOT NULL,
    deductibleFamily REAL NOT NULL,
    deductibleMetIndividual REAL NOT NULL,
    deductibleMetFamily REAL NOT NULL,
    outOfPocketMaxIndividual REAL NOT NULL,
    outOfPocketMaxFamily REAL NOT NULL,
    outOfPocketMetIndividual REAL NOT NULL,
    outOfPocketMetFamily REAL NOT NULL,
    planDocumentUrl TEXT NOT NULL,
    coverage TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    credentials TEXT NOT NULL,
    network TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT NOT NULL,
    phone TEXT NOT NULL,
    distanceMiles REAL NOT NULL,
    rating REAL NOT NULL,
    acceptingNewPatients INTEGER NOT NULL,
    telehealth INTEGER NOT NULL,
    languages TEXT NOT NULL,
    bio TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS claims (
    id TEXT PRIMARY KEY,
    claimNumber TEXT NOT NULL,
    memberId TEXT NOT NULL,
    patientId TEXT NOT NULL,
    patientName TEXT NOT NULL,
    providerId TEXT NOT NULL,
    providerName TEXT NOT NULL,
    serviceDate TEXT NOT NULL,
    submittedDate TEXT NOT NULL,
    processedDate TEXT,
    status TEXT NOT NULL,
    serviceType TEXT NOT NULL,
    diagnosisSummary TEXT NOT NULL,
    billedAmount REAL NOT NULL,
    allowedAmount REAL NOT NULL,
    planPaid REAL NOT NULL,
    deductibleApplied REAL NOT NULL,
    copayApplied REAL NOT NULL,
    coinsuranceApplied REAL NOT NULL,
    memberResponsibility REAL NOT NULL,
    denialReason TEXT,
    eobAvailable INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS priorAuthorizations (
    id TEXT PRIMARY KEY,
    memberId TEXT NOT NULL,
    patientId TEXT NOT NULL,
    patientName TEXT NOT NULL,
    providerId TEXT NOT NULL,
    providerName TEXT NOT NULL,
    serviceRequested TEXT NOT NULL,
    requestedDate TEXT NOT NULL,
    decisionDate TEXT,
    status TEXT NOT NULL,
    validThrough TEXT,
    notes TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    memberId TEXT NOT NULL,
    periodLabel TEXT NOT NULL,
    amount REAL NOT NULL,
    dueDate TEXT NOT NULL,
    paidDate TEXT,
    status TEXT NOT NULL,
    method TEXT NOT NULL,
    invoiceNumber TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    memberId TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    relatedClaimId TEXT
  );
`);

// Migration for databases created before login support existed: add the
// column CREATE TABLE IF NOT EXISTS won't retrofit onto an existing table.
const memberColumns = db.prepare('PRAGMA table_info(members)').all() as { name: string }[];
if (!memberColumns.some((c) => c.name === 'passwordHash')) {
  db.exec('ALTER TABLE members ADD COLUMN passwordHash TEXT');
}
