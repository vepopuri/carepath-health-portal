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

Everything in this build is **demo data and simulated actions** — every page carries a "Demo data"
chip as a reminder. Filing a claim, requesting a prior authorization, and paying a premium all
mutate an in-memory (and `localStorage`-persisted) mock store; no real insurer, payment processor,
or provider directory is called. This mirrors how the Octopus platform itself started before its
first two live integrations (a real GitHub PR and a real OSV.dev dependency scan) were added.

## Architecture

Same layered pattern as Octopus:

```
src/types/domain.ts        Shared TypeScript types (Member, Plan, Claim, Provider, …)
src/data/*.ts               Static seed data
src/services/*Service.ts    Mock async service layer (Promise-based; swap the body for a real
                            fetch() later without touching any page)
src/components/             Shared UI (common/) and app chrome (shell/)
src/pages/*.tsx             One page per route, with dedicated detail pages for providers and claims
```

## Running locally

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check and production build
npm run lint      # oxlint
```

## What's next

This first pass covers the core "check my coverage, find a doctor, file and track a claim, pay my
bill" loop. Not yet built (left for a fast-follow, same as Octopus's own iterative history):

- A **Messages** / support-ticket page.
- A **Profile / Settings** page (contact info, notification preferences).
- Provider detail pages don't yet support real appointment booking (deliberately disabled with a
  note — this is a demo, not a scheduling system).
