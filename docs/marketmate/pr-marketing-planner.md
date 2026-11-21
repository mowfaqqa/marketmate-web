# feat: add seven-day marketing planner

Base branch `feat/branded-graphics`. Feature branch `feat/marketing-planner`.

Owners can select up to five products and a Lagos start date to create seven Instagram and WhatsApp tasks. Each day has its own caption and approval. Owners can edit a day, swap two dates, regenerate a caption, copy approved text, render an approved graphic, and mark work done or reopen it.

Plans reserve three units through a single database transaction. A day regeneration uses one unit. The planner preserves prior captions and requires confirmation to edit completed work. Offer copy is used only when the offer is active at generation and covers the entire planned Lagos date. Days outside that window use inquiry copy.

Apply the additive Prisma migration. Local generation uses the existing `STUDIO_LOCAL_GENERATOR` switch. Plan creation, day updates and completion are limited to five, 20 and 30 requests per owner per minute respectively.

Production builds, dependency checks and local PostgreSQL HTTP tests passed. The planner tests cover consecutive dates, idempotency, quotas, offer fallback, swapping, approval, completion, regeneration and tenant isolation.
