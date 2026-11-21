# OpenAI marketing generation and Home activity

Studio and Planner previously generated only labelled local samples. They now queue OpenAI Responses requests from saved product facts. Studio returns three validated variants; each planner day requests one caption. Manual drafts remain available when configuration is incomplete, the provider fails or the daily budget is exhausted.

## Implementation

- Separate configuration, prompt/schema validation, HTTP adapter, cost accounting and job worker modules under `backend/src/ai`.
- Strict structured output; facts are untrusted data. The app appends authoritative prices, contacts and offer dates. Customer and payment information is excluded from the provider payload. Requests use `store:false`; this alone is not a guarantee of zero provider retention.
- Server-only credentials, pinned queued model, bounded responses/deadlines, one repair for malformed output, no automatic transport retry, and a short process-local outage circuit breaker.
- Persistent claims and two concurrent jobs per business. Expired/uncertain requests are not replayed. Conditional job settlement prevents duplicate draft writes.
- Shared UTC daily cost ledger with reservations and attempt usage. Unknown usage retains its reservation conservatively. Rates and price version are configurable and must match the selected model; this is an estimate, not provider billing reconciliation.
- Plan generation retains successful days after partial failure. Partial/failed plans release their three-unit reservation. Individual regenerations use their normal unit allowance.
- Home shows up to five items per section, with a full overdue count. All activity queries use the authenticated business. Dates use Africa/Lagos, matching the planner; completed tasks and archived products are excluded from due lists. Refresh errors retain the last visible data and offer retry.

## Offline validation

- API and frontend TypeScript checks.
- OpenAI adapter tests with simulated transport: strict output, private-field exclusion, refusal, timeout, response-size limits and safe errors.
- In-memory cost tests: known usage settlement, budget rejection, one repair, unknown-cost holds, no transport retry and pinned model.
- Dashboard tests: Lagos midnight boundary, bounded owner-scoped queries and incomplete-task filtering.
- Production builds and Prisma schema validation, without applying migrations.

## Deferred integration gate

At the owner’s request, database and live-model testing will run together at the final integration pass. No migration or real OpenAI request was run for this change. Before that pass, configure an isolated test database, a structured-output-capable model, current token rates and an approved daily spend limit.

Verify actual database locking under concurrent requests, duplicate request idempotency, leases/restarts, exactly-once quota settlement, month boundaries, shared daily cost limits, partial-plan recovery, stale-source rejection and tenant isolation. Run sales integration checks against that same isolated environment. Then check the live Studio/Planner workflow, factual correctness and language quality, including refusal behavior and a curated evaluation set. Pidgin generation remains outside the current English-only implementation. Browser/mobile and real R2/Brevo checks remain outstanding.

Next marketing work remains logo upload, device sharing, capacity enforcement, autosave/reconnect review and privacy-minimized events. This change is not a beta-readiness declaration. Git metadata is read-only in this session, so no feature branch or commit was created.
