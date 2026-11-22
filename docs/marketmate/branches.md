# Feature branches and PR descriptions

Use stacked branches in the dependency order below. Every branch gets a conventional commit and a PR against its predecessor; after merge, retarget the next PR to main. Keep integration on main reviewable. No remote has been configured and no push is authorized by this document.

| Branch                                            | Commit                                               | Scope                                                              |
| ------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------ |
| feat/project-foundation                           | chore: initialize MarketMate application workspace   | Next.js, NestJS, Prisma tooling, Postgres setup and reference docs |
| feat/identity-business                            | feat: add owner authentication and business setup    | FR01–04, sessions, verification, reset, tenant guard               |
| [feat/catalogue-offers](pr-catalogue-offers.md)   | feat: add product library and factual offers         | FR05–08, private image assets and version conflicts                |
| [feat/marketing-studio](pr-marketing-studio.md)   | feat: add durable promotion drafts and approval      | FR09–12/22, provider adapter, reservations, versioned approval     |
| [feat/branded-graphics](pr-branded-graphics.md)   | feat: add reviewed promotional graphic exports       | FR13–15, three layouts, two sizes, stale checks                    |
| [feat/marketing-planner](pr-marketing-planner.md) | feat: add seven-day marketing checklist              | FR16–17, local dates, item edits and completion                    |
| feat/sales-documents                              | feat: add private quotations invoices and payments   | FR18–21, integer money, immutable snapshots, PDFs                  |
| feat/usage-billing                                | feat: add usage accounting and subscription adapters | FR23–24, checkout disabled until approved                          |
| feat/operations-quality                           | feat: add data rights and operational controls       | FR25–27, audits, recovery, exports, deletion                       |

## Foundation PR

Title: chore: initialize MarketMate application workspace

Creates a fresh pnpm workspace for the requested Next.js frontend and NestJS API, with Prisma tooling and a local PostgreSQL service. Adds the supplied PRD text, design/flow reference and dependency-ordered feature branch plan. Provides an explicitly labelled development home preview; no user accounts or AI services are implied to exist.

Validation: record actual installation, typecheck and build results before opening the PR.

## Feature PR template

Title: use the conventional commit in the table.

Problem and behavior: describe the requirement IDs addressed and an observable before/after outcome.

Changes: list the domain, API, UI and additive migration changes actually implemented.

Validation: record executed checks, tenant isolation and relevant failure/retry behavior; distinguish stubs from real provider evidence.

Dependencies and rollout: name the preceding branch, required environment variables, feature switches and migration/rollback constraints. List remaining release gates without claiming they passed.
