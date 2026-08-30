# 03: Better Auth + Identity Verification

**What to build:** A Guest can register and log in. Registration includes Identity Verification: uploading an ID card or passport image (supporting foreign Guests across Regions), which is stored in Cloudinary and marks the account verified immediately — no approval queue. Users carry a role (`guest` / `management`), and action routes can require a verified account. Unverified accounts cannot perform Guest actions.

**Blocked by:** 01 (Scaffold + DB tracer bullet)

**Status:** ready-for-agent

- [ ] Better Auth configured with Drizzle adapter; sign-up, login, and session endpoints work
- [ ] User carries a `guest` / `management` role; role guard available for routes
- [ ] Identity Verification endpoint accepts an ID card or passport image, uploads to Cloudinary (signed upload), and records document type, URL, and verified timestamp
- [ ] Verification gate helper: booking/review-class actions reject unverified accounts
- [ ] Tests: sign-up → verify → session works; unverified account is rejected by a gated route; `management` role can pass the management guard while `guest` cannot
