# feat: add product library and factual offers

Base: `feat/identity-business` · Branch: `feat/catalogue-offers`

Owners can save products and services, search the library, attach a private photo, archive or restore an item, and schedule a single current offer per product (FR05–08). Home shows the actual active product count. Library search and pagination survive a trip to the editor.

- Store exact kobo values and owner-confirmed facts. Reject stale writes, incompatible prices and cross-business IDs.
- Use UTC offer times with Lagos time in the editor. Preserve superseded offers and bump the product version when its facts, offer, photo or archive state change.
- Validate photo signatures, dimensions and upload size before storing stripped WebP images and previews in a private Cloudflare R2 bucket. Reads require a short-lived link and the owner’s session.
- Apply rate limits to all API routes, with tighter limits for authentication and uploads. Return `429` and `Retry-After` when a limit is reached.

Additive migrations preserve existing account data and earlier development images. New uploads store object keys and metadata in PostgreSQL; image bytes go to R2. Configure the private bucket before enabling uploads. Scheduled cleanup for abandoned objects and draft staleness checks belong to the operations and Studio branches respectively.

See [R2 setup](r2-setup.md) and the [implementation status](implementation-status.md) for validation and outstanding release decisions.
