# feat: add Marketing Studio and draft review

Base branch `feat/catalogue-offers`. Feature branch `feat/marketing-studio`.

Owners can review the saved product, price, offer expiry and public contact before starting a promotion. They can write a manual draft, save revisions, approve a specific version and copy the assembled text. Archived work can be reopened or duplicated as a new manual draft against current facts.

Local generation persists a job, reserves one unit against the account's current monthly period, and creates three sample variants. Duplicate requests reuse the original job. Failed and expired jobs release the unit. Manual drafts and edits are free. Studio starts are limited to five requests per business per minute.

Apply the additive Prisma migration before starting the API. Set `STUDIO_LOCAL_GENERATOR=true` in local development to try queued sample generation. The monthly test allowance defaults to 25 and can be changed with `STUDIO_MONTHLY_UNITS`. Production generation remains disabled while the provider, model and daily spend cap are pending. Draft checks currently use deterministic rules. A provider integration will need its own structured output and factual review checks before live generation.

Validation covers workspace builds and type checks, the dependency audit, fresh PostgreSQL migrations, and the local HTTP suite for idempotency, allowance, draft approval, stale facts and business isolation.
