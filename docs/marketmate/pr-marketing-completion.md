# Logo uploads, sharing, capacity limits and autosave

Business owners can upload, replace and remove a private logo from Settings. Uploads reuse the existing still-image validation, strip metadata and preserve transparency. New branded graphics include the logo. Logo changes increment the business version, so existing approvals must be reviewed against the changed source before export.

All file writes use Cloudflare R2 through the existing server-side S3-compatible adapter. There is no new public bucket or alternative provider. Browser requests use the authenticated API; credentials never go to the frontend. Populate `backend/.env` from the R2 fields below. Existing values were preserved and missing placeholders added.

## Environment

- `R2_ACCOUNT_ID`: Cloudflare account ID (32 hexadecimal characters).
- `R2_BUCKET`: private R2 bucket name.
- `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`: credentials with object read/write access for that bucket.
- `R2_JURISDICTION`: leave blank for the default endpoint; use `eu` or `fedramp` only for a bucket in that jurisdiction.
- `ASSET_SIGNING_KEY`: independent random secret of at least 32 characters for authenticated photo links.
- `ACTIVE_PRODUCT_LIMIT=50` and `STORAGE_LIMIT_BYTES=524288000`: configurable per-business capacities.

The endpoint is constructed as `https://<account-id>[.<jurisdiction>].r2.cloudflarestorage.com`, with region `auto`. `R2_TEST_ENDPOINT` is allowed only for loopback tests and is not a deployment setting. The bucket does not need a public domain or browser CORS configuration because the API transfers files.

## Behavior

- Active-product capacity is checked under a business-row lock for creation and restoration. Idempotent creation retries do not consume another slot; archiving frees an active-product slot.
- Every R2 write reserves its bytes in `StoredObject` before transfer, under the same per-business lock. Photos and previews, logos, graphics and PDFs share the limit. Successful deletion frees bytes. Unknown upload or deletion outcomes retain their capacity conservatively.
- The additive migration backfills referenced R2 files. Old preview, graphic and PDF sizes are unknown, so the backfill uses conservative read limits. Reconcile these entries against actual R2 object sizes during the final integration pass; do not simply reset the ledger. Old unreferenced/orphaned files need an object inventory and cleanup before the limit can be treated as an exact bucket inventory.
- Settings shows active-product and storage usage, including reservations. Failed cleanup can temporarily reduce available storage; retry cleanup after confirming the object is unreferenced. A full self-service storage browser is not included.
- Approved captions and rendered graphics can use device sharing. Unsupported or denied sharing falls back to clipboard/download; clipboard failure exposes selectable text. Cancelled sharing does not trigger a download. The UI never treats handing content to another app as confirmed publication. Both caption and graphic are checked by the server before export.
- Autosave waits one second after typing. It covers business profiles, existing products, Studio revisions and unfinished Planner items. New products and offers require explicit save. Completed planner items and date swaps require explicit confirmation/save. Approval and generation are never automatic.
- Invalid forms do not autosubmit. Failed saves keep text in the current tab. Reconnect resumes eligible saves; version conflicts pause autosave and require review of the latest record. Unsaved edits trigger a browser unload warning. Edits are not persisted in browser storage, so closing/discarding the tab can still lose unacknowledged changes.

## Validation and deferred work

Type checks, production builds, Prisma schema validation and offline tests cover R2 endpoint selection, capacity boundaries and idempotency, owner separation, reservation before upload, uncertain-write holds, deletion accounting, image validation/transparency, logo request validation and logo compositing.

No database migration, real R2 request or live OpenAI call was run. During the final integration pass: apply the new migration after the sales/AI migrations, test cross-tenant logo access, concurrent create/restore/upload limits, replacement/deletion and stale approvals, interrupted uploads, and quota reconciliation. Browser tests must cover native sharing, cancellation, fallback downloads, typing during saves, offline/reconnect, conflicts, and mobile logo previews. Billing and product events remain separate work.
