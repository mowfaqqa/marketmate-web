# feat: render branded graphics from approved drafts

Base branch `feat/marketing-studio`. Feature branch `feat/branded-graphics`.

Studio owners can preview and download PNGs from an approved draft. Product spotlight, offer card and service invitation are available in square and story sizes. Graphics use the approved first sentence, business name and colour, product photo or service placeholder, saved price and public contact. Offer graphics include the expiry and terms.

Preview and download serve the same private R2 object after rechecking tenant ownership, current approval and source facts. The render specification includes the source revision, template version, photo reference and brand and product snapshots. Identical specifications reuse their render. New renders reserve a slot from a configurable monthly allowance, and failed renders release their slot.

Apply the additive Prisma migration and configure the existing private R2 bucket. `STUDIO_MONTHLY_GRAPHICS` defaults to 100. Render requests allow eight per business per minute and file requests allow 30 per owner per minute.

Validation covered all six PNG outputs, byte-identical previews and downloads, tenant isolation, cache reuse, expired-offer rejection, migrations, production builds and the local regression suite. Storage verification used the local S3-compatible harness. Brand marks use the saved business name because the profile has no uploaded logo field.
