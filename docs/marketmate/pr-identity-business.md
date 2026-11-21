# feat: add owner authentication and business setup

Base branch: `feat/project-foundation`
Feature branch: `feat/identity-business`

Owners can create an account, verify their email, sign in, recover their password and save a business profile. The home screen now loads the signed-in account and links to setup. This implements the account and profile portion of FR01–03; FR04 marketing usage and jobs remain pending their feature branches.

## Changes

- Create one owner and one business atomically; resolve business ownership from the session instead of client-supplied IDs.
- Store salted scrypt password hashes and hashed opaque session and single-use account tokens.
- Revoke the current session on logout and all owner sessions after password reset.
- Validate contact actions and profile fields; reject stale profile versions with 409 and preserve form text for copying or retry.
- Add sign-up, sign-in, verification, recovery and business setup screens, with save feedback and account-aware home state.
- Protect mutations with exact Origin checks and account endpoints with a simple process-local IP rate limit.
- Add same-origin API proxy, development email files and a Brevo adapter following its official transactional email contract.

## Validation

Both application production builds and TypeScript checks pass. The initial PostgreSQL migration applied successfully in an isolated local database. All 35 HTTP acceptance checks pass, including rate limiting. Checks cover malformed input, origin rejection, distinct businesses, rejected ownership injection, profile validation and conflicts, single-use verification, generic recovery responses, password changes and session revocation. Browser checks confirm sign-in, persisted profile load and successful save feedback with synthetic data.

## Setup and release limits

Run Prisma generation and migrations before starting the API. Local mail requires `MAIL_MODE=file`; production needs a verified Brevo sender, `BREVO_API_KEY` and `MAIL_FROM`. No real email was sent during validation. Cookies require HTTPS in production. Rate limits are process-local; use a shared limiter before scaling beyond one API instance. Expired session/token cleanup and operational alerting belong to the operations branch. No AI requests, paid access, deployment or GitHub push is included.

This is the first committed schema, not a migration of the previous invoicing application. No destructive reset is performed. Roll back application code only against a compatible schema; preserve account records.

## References

[NestJS validation](https://docs.nestjs.com/techniques/validation) and [Brevo transactional email](https://developers.brevo.com/reference/send-transac-email).
