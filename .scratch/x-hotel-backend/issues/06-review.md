# 06: Review

**What to build:** A verified Guest who completed an Actual Check-in at a Hotel can leave a Review: a required 0–5 star rating (0 included) plus an optional comment. Guests who never checked in cannot review — no drive-by spam. Each Guest has one Review per Hotel and can edit their own Review when they change their mind.

**Blocked by:** 05 (Actual Check-in)

**Status:** ready-for-agent

- [ ] Review schema: Guest, Hotel, rating (0–5 integer), optional comment, timestamps, unique per Guest + Hotel
- [ ] `POST /hotels/:id/reviews` accepted only when the caller has a CHECKED_IN Booking at that Hotel; rating bounds 0 and 5 accepted, out-of-range rejected
- [ ] `PATCH /reviews/:id` lets the owner edit rating and comment; non-owner rejected
- [ ] A second Review by the same Guest for the same Hotel is rejected (edit instead)
- [ ] Hotel detail response (from the catalog endpoint) includes Reviews and average rating
- [ ] Tests: no stay → rejected; after check-in → accepted; bounds enforced; duplicate rejected; edit works; non-owner edit rejected
