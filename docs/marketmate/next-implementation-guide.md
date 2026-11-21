# MarketMate next implementation guide

Updated 18 November 2026 against the current Marketing Planner implementation and V1 PRD.

## Working rules

- Implement one usable feature at a time, with a feature branch and conventional commit. Include a short PR description covering behavior, validation and open limitations.
- Preserve existing uncommitted changes. Stage only changes made for the feature; do not reset or absorb unrelated work.
- Keep controllers thin. Separate input validation, domain logic and external-provider calls where they have distinct responsibilities. Prefer plain functions for calculations and one service per coherent feature.
- Keep NestJS, Prisma and PostgreSQL. Use the existing database-backed job approach unless a demonstrated requirement needs another service. Do not introduce Redis, microservices or a generic workflow engine by default.
- Reuse tenant authorization, version checks, storage and UI components. Do not introduce parallel versions of these facilities.
- Use additive migrations; never reset a database or rewrite issued records.
- Test financial calculations, tenant boundaries, idempotency, quota settlement and failure recovery. Build and type-check both applications for each completed feature.
- Document implementation separately from live verification. Local sample output is not live AI evidence.
- Continue offline implementation with OpenAI as the selected provider. Defer database and live-model testing until the final integration pass, as instructed. Resolve spending configuration before live requests and commercial/financial policies before production enablement.

## Current baseline

Authentication, business profiles, catalogue/offers, local Studio generation, approved graphics and the seven-day planner exist. OpenAI generation and sales documents are implemented in the working tree, with database and live-model integration verification deferred at the owner’s request. Billing and data-rights operations remain absent. Existing test notes cover local services, not live R2 or Brevo verification. The working tree contains existing user changes.

## 1. Live marketing generation — FR09–12, FR16–17, FR22

Branch: `feat/live-marketing-generation`.

Provider decision: OpenAI (confirmed). Implement now; configure the model, current token prices and deployment-wide daily budget before the deferred live tests. Keep credentials in server environment configuration; never request them in chat.

Implementation:
1. Add a small provider module with a typed request/result contract and one concrete selected-provider adapter. Retain the explicitly labelled local generator for tests.
2. Keep prompt construction and output validation separate from the adapter. Treat product text as untrusted input. Insert prices, contact details and offer dates from validated snapshots.
3. Connect Studio jobs to the adapter. Claim work transactionally before provider calls; use bounded deadlines and at most one malformed-output repair. Track attempts and settle each reservation once.
4. Connect Planner through the same generation service. Persist pending work before provider calls; retain successful days if another day fails. Never hold a database transaction open during a network call.
5. Record model, latency, usage and estimated cost. Enforce the approved daily budget and per-business concurrency. Failed user requests still record incurred provider cost.
6. Add provider-unavailable, pending, validation-failure and budget-exhausted states to the UI. Preserve manual drafting and access to saved work.

Completion evidence: three valid text variants; seven dated plan items; duplicate requests do not double-charge; stale facts block export; provider failure releases quota once; restart/timeout recovery is demonstrated. Run a small live smoke test only with configured credentials and the approved budget. Evaluate factual and language quality before external beta.

## 2. Supporting sales documents — FR18–21

Branch: `feat/sales-documents`.

Implement in order:
1. Tenant-owned customer records and draft quotation/invoice models.
2. Pure, tested money calculations using integer kobo and explicit decimal quantities/rates. Follow the PRD rounding and limits; do not infer tax rates.
3. Draft editor with customer, product lines, delivery, discounts and payment instructions; use authoritative server totals.
4. Transactional issuance with unique business document numbering, immutable snapshots and persistent idempotency.
5. Private PDF rendering and authenticated downloads through the storage boundary.
6. One linked invoice draft per quotation conversion; append-only manual payments and full reversals; guarded voiding and linked replacements.

Keep customer data and financial payment instructions out of AI inputs. Confirm tax treatment and financial retention before enabling those real-world use cases.

Completion evidence: PRD calculation fixtures, cross-tenant denial, duplicate issue/conversion/payment requests, payment limits, snapshot preservation after catalogue edits, and PDF totals matching the issued document.

## 3. Finish the marketing experience and allowances — FR02–04, FR13–17, FR23

Branch: `feat/marketing-completion`.

- Add logo upload using existing validated private media infrastructure.
- Show recent drafts, pending jobs, today's item, overdue items and remaining allowances on Home.
- Add device sharing with clipboard/download fallbacks; never describe a share attempt as publication.
- Enforce configurable active-product and stored-asset capacity limits transactionally.
- Review autosave, acknowledged-save indicators, version conflicts and reconnect behavior across editors.
- Add privacy-minimized, deduplicated product events for the PRD activation and retention metrics.

Completion evidence: first-promotion journey on mobile; capacity boundaries; cancelled/unsupported sharing; stale-edit conflicts; no customer data in analytics.

## 4. Operations and free-beta readiness — FR25–27

Branch: `feat/operations-quality`.

- Durable reauthenticated data-export and account-deletion requests, private export files and retention cleanup.
- Request IDs, safe structured logs, useful dependency health checks, alerts and minimal audited support actions.
- Deployment configuration, secrets handling, backup/restore rehearsal and incident runbooks.
- Live R2 and Brevo verification; keyboard, screen-reader, mobile, slow-network and load checks.
- Privacy notice, provider processing terms and retention decisions before a real-data pilot.

Completion evidence: the PRD core journey from signup through approved marketing export, planning and invoice issuance, plus tenant isolation, restore and deletion checks. Do not declare beta ready solely because builds pass.

## 5. Paid subscriptions — FR24

Branch: `feat/usage-billing`.

Confirm gateway, price, allowances, refunds and cancellation terms before charging. Add hosted checkout, verified/deduplicated webhook receipts, entitlement updates, renewal handling and daily reconciliation. Browser success redirects never grant access. Keep checkout disabled until provider test cases and the paid gate pass.

## Engineering follow-through

- Add Swagger/OpenAPI documentation as API modules are completed; document session authentication, request origins, errors and idempotency.
- Update README and implementation status with every completed feature.
- Resolve the earlier request for independent `web/` and `api/` repositories before restructuring: current code uses a single `frontend/` + `backend/` pnpm workspace. Preserve history and existing edits when making that transition; do not mix it with a domain feature.

## Immediate status

18 November 2026: OpenAI generation is implemented for Studio and Planner, with strict output validation, durable jobs, daily cost reservations, one malformed-output repair, and safe failure states. Sales documents remain implemented. Home now has a bounded, owner-scoped activity endpoint and recent drafts, pending jobs, today’s tasks and overdue items; existing allowance cards remain in place.

Database migrations and live-model testing are deliberately deferred together. Do not run migrations or live generation as part of the current offline pass. Configure the isolated test database, selected model, current prices and approved spend cap for that later pass. No credentials belong in chat or frontend configuration.

Logo uploads, graphic logo compositing, device sharing, capacity enforcement and autosave/reconnect improvements are now implemented; see `pr-marketing-completion.md`. Next implementation work: minimal product events, then operations. Browser, concurrency and live-service evidence remain outstanding; implementation alone does not establish beta readiness. See `pr-live-marketing-generation.md` for checks and remaining integration evidence. Git metadata permissions prevent branch creation and commits; source changes remain uncommitted.
