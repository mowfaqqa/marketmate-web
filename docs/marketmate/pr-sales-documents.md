# feat: add supporting sales documents and private PDFs

Owners can now create customers while preparing quotations or invoices, review server-calculated totals, issue an immutable numbered document and download its private PDF. Quotations convert into a single linked invoice draft. Manual payments support partial settlement and append-only reversals; unpaid issued documents can be voided and replaced with a linked draft.

## Implementation

- `backend/src/sales/money.ts`: exact integer-kobo calculations, decimal quantity/rate parsing, half-up rounding and bounds.
- Sales DTOs/controllers/service: tenant ownership, version conflicts and durable idempotency receipts. A short per-business database lock serializes financial writes and numbering. External storage calls never run inside these transactions.
- Additive Prisma migration: customers, documents, separate numbering counters, payments, reversals, action receipts, foreign keys and financial checks.
- PDF worker: persistent states, expiring claim leases, immutable source snapshots and template version, private R2 objects, guarded download and retry without issuing again. Draft previews and void labels are included.
- `/invoices`, `/invoices/new`, `/invoices/[id]`: customer creation/editing, catalogue selection, draft review, issuance, PDF status/download, payments, history export, correction and conversion workflows. Financial actions ask for explicit confirmation.
- Swagger documentation at `/api/docs`: sales DTOs, cookie authentication and idempotency headers. Older feature schemas are not yet fully annotated.

## Validation

Passed: frontend/backend type checks and production builds; dependency resolution; exact PRD financial example, rounding and invalid-value tests; PDF text extraction for a single invoice, void invoice and 50 long lines with long terms. Sample PDF pages were visually inspected. Prisma Client generation, schema validation, migration SQL generation and OpenAPI schema checks succeeded. A footer spacing issue found during PDF inspection was corrected.

Not executed: database-backed migration/application tests and HTTP concurrency/tenant suite. The configured test server at localhost:55433 was unreachable. A separate local PostgreSQL initialization failed because shared-memory creation is restricted. Connection to the default local PostgreSQL service with the existing configured credentials also failed. No existing database was modified.

Run `pnpm --filter @marketmate/api test:sales` with an isolated `TEST_DATABASE_URL` (database name must contain `test`). The suite exercises duplicate requests, cross-tenant denial, immutable snapshots, concurrent conversion/payment, payment limits, reversal, void/replacement, filtering and private PDFs through local S3-compatible storage. Complete browser workflow verification afterwards.

## Rollout and remaining limits

Apply migrations before deploying the updated API. Production issuance requires `SALES_LAUNCH_APPROVED=true` after finance/tax-use-case and financial-retention review. Live R2, deployment and full font/accessibility QA remain open. PDF history is exported separately as JSON so payment updates do not rewrite the issued financial snapshot. Historical PDF object cleanup remains part of the retention milestone. Drafts use explicit saves; automatic content saving is not claimed here. Linked conversion/replacement drafts cannot be deleted because the association preserves deduplication/history.

The planned branch is `feat/sales-documents`, based on `feat/marketing-planner`. This session cannot modify `.git`, so branch creation and committing were blocked. Existing uncommitted changes outside this feature remain untouched. No PR has been opened or pushed.
