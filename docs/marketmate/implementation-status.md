# MarketMate implementation status

- `feat/project-foundation`: workspace, PostgreSQL configuration, home preview, design and workflow reference.
- `feat/identity-business`: registration, verification, sessions, password recovery, business profiles and account-aware home.
- `feat/catalogue-offers`: products and services, search and paging, exact NGN pricing, archive and restore, dated offers, private R2 photos and API rate limits.

Validation: all 29 declared dependencies were found at their installed versions and runtime imports resolved. Both applications build and pass type checks. All four migrations apply on fresh PostgreSQL. The local S3-compatible test passed 117 catalogue checks and 35 account checks, including signed object operations, tenant isolation, and retry headers for limits. Browser validation before the storage switch covered creation, upload, offer, search return, archive and restore, and a 360 px editor with no horizontal overflow. No live R2 requests were sent.

- `feat/marketing-studio` adds briefs, saved manual drafts, local generation jobs, quota reservations, revision history, approval, copying, duplication and feedback.

- `feat/branded-graphics` adds six PNG layout and size combinations, authenticated R2 previews and downloads, stale-source checks and render allowances.

- `feat/marketing-planner` adds seven-day plans, date swaps, caption revisions, approval and completion.

Sales-document implementation is now present in the working tree (17 November 2026), but its database-backed integration checks have not run. It includes tenant-owned customers, versioned drafts, exact kobo calculations, transactional issuance and numbering, immutable snapshots, quotation conversion, manual payments/reversals, void/replacement history, private asynchronous PDFs, document-history export, UI and initial Swagger documentation. See `pr-sales-documents.md` for validation and limitations.

18 November 2026: OpenAI is the selected provider. Studio and Planner integration, strict validation, durable processing, cost reservations and safe failure states are implemented. Offline provider-contract and in-memory budget checks pass. Model/pricing/budget configuration is required before live use. Database and live-model tests are deferred together at the owner’s request. Home activity now shows recent drafts, pending work, today’s incomplete tasks and overdue items. Logo upload/removal and graphic compositing, device sharing with fallbacks, active-product and shared R2 storage capacities, and autosave improvements are now implemented. See `pr-marketing-completion.md`. Browser and database concurrency verification remain deferred; privacy-minimized product events remain open. Billing and operations remain open. Live R2, Brevo and deployment verification remain open. The root README now reflects the current marketing features.

Git branch creation and commits are blocked by read-only Git metadata in this session; these changes are not committed. Existing user modifications were preserved.
