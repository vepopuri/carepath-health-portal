# CarePath — Health Plan Member Portal

CarePath is a demo customer-facing self-service portal for a health insurance member. It's a
member-facing companion to [Octopus](https://github.com/vepopuri/secure_sdlc) — the governed,
multi-agent secure-SDLC platform — built as an illustration of the kind of real, working product
Octopus's 36 specialized agents (Requirements, Architecture, API Design, Code Generation, Test
Generation, Security Scan, and the rest) would produce end to end, from a blank repository to a
usable app. No agent pipeline actually ran to generate this code; this repo is built by hand to
the same standard, in the same architectural style, as a demonstration.

## What this app is

A member logs in (there's no real auth in this demo — you're always signed in as the seeded demo
member, Jordan Alvarez) and can:

- **Overview** — plan snapshot, deductible/out-of-pocket progress, recent activity, who's covered.
- **My Plan** — coverage details by category, deductible and out-of-pocket tracking (individual and family).
- **Family** — see everyone covered under the plan, add a dependent, or remove one.
- **Find Care** — search and filter the provider directory; view a provider's detail page.
- **Claims** — track claims for the member and their dependents; file a new claim; see a full
  cost breakdown (billed, allowed, deductible/copay/coinsurance applied, plan paid, member owes).
- **Prior Authorizations** — track and request authorizations some services require before care.
- **Billing & Payments** — premium status, payment history, pay a scheduled premium.
- **Documents** — ID card, explanations of benefits (EOBs), plan documents, tax forms.

## What's simulated vs. real

The **domain** is a demo — every page carries a "Demo data" chip, no real insurer, payment
processor, or provider directory is called, and filing a claim or paying a premium never contacts
anyone real. But the **stack underneath it is real**: a small Express API backed by a SQLite
database that persists to disk. Filing a claim, adding a dependent, or paying a premium performs
a real HTTP request and a real database write that survives a server restart — it's not
`localStorage` sleight of hand. This mirrors how the Octopus platform itself started before its
first two live integrations (a real GitHub PR and a real OSV.dev dependency scan) were added.

## Architecture

Same layered pattern as Octopus, now with a real backend underneath:

```
src/types/domain.ts        Shared TypeScript types (Member, Plan, Claim, Provider, …) — imported
                            by both the frontend and the server
src/services/*Service.ts   Frontend service layer (Promise-based); each function calls the API
                            over fetch() through src/services/api.ts
src/components/             Shared UI (common/) and app chrome (shell/)
src/pages/*.tsx             One page per route, with dedicated detail pages for providers and claims

server/index.ts             Express app entrypoint — mounts the API routes and, in production,
                            serves the built frontend
server/db.ts                SQLite connection (better-sqlite3) + schema creation
server/seedData.ts          Demo seed data (member, plan, providers, claims, …)
server/seed.ts              Seeds empty tables on first run; idempotent on every later start
server/routes/*.ts          One Express router per resource (member, plan, providers, claims, …)
```

In dev, Vite (the frontend) and the Express API run as two processes; Vite proxies `/api/*`
requests to Express. In production, Express serves the built frontend directly, so it's a single
process and a single port.

## Running locally

```bash
npm install
npm run dev       # start the Vite dev server + the Express API together
npm run build     # type-check (frontend and server) and production build
npm start         # run the production build behind a single Express server
npm run lint      # oxlint
```

The SQLite database file (`server/carepath.db`) is created and seeded automatically the first
time the API starts, and is gitignored — delete it to reset the demo back to its seed state.

## What's next

This first pass covers the core "check my coverage, find a doctor, file and track a claim, pay my
bill" loop. Not yet built (left for a fast-follow, same as Octopus's own iterative history):

- Real authentication. The API and database are multi-request-ready, but there's still only one
  member and no login — every request is always "Jordan Alvarez."
- A **Messages** / support-ticket page.
- A **Profile / Settings** page (contact info, notification preferences).
- Provider detail pages don't yet support real appointment booking (deliberately disabled with a
  note — this is a demo, not a scheduling system).
