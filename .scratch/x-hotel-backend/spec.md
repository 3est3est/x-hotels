# Spec 0001 — X Hotel Backend

Status: ready-for-agent

## Problem Statement

The X Hotel group operates hotels across multiple Regions and plans to expand into new ones (for example Israel). Today there is no system where Guests can discover the group's hotels, reserve a stay, and where Hotel Management can see how bookings translate into Actual Check-ins. The owner currently has no way to answer basic questions such as "which Room Type is booked most?" or "what percentage of bookings resulted in a real check-in?".

The system must serve the group's own hotels only — it is explicitly not a marketplace, and external hotels cannot join.

## Solution

A backend API for a hotel reservation system, built backend-first so the frontend framework can be chosen later without rewriting core logic. Guests browse hotel information without logging in; registering includes Identity Verification (uploading an ID card or passport); verified Guests create Bookings (Room Type, number of guests, check-in date, number of nights) with no availability checking and pay On-site at the hotel. Hotel Management marks Actual Check-ins and reads all-time statistics computed on the server: total bookings, Actual Check-ins, check-in percentage, and the most-booked Room Type, Hotel, and Region.

## User Stories

1. As an anonymous Guest, I want to search for hotels, so that I can find where to stay without logging in.
2. As an anonymous Guest, I want search results to contain only X Hotel group hotels, so that I am never shown external hotels.
3. As an anonymous Guest, I want to browse hotels by Region, so that I can plan travel to a specific area.
4. As an anonymous Guest, I want to view a Hotel's details (name, description, images, Region), so that I can evaluate it before booking.
5. As an anonymous Guest, I want to view a Hotel's Room Types and their information, so that I understand my accommodation options.
6. As an anonymous Guest, I want to see a Hotel's Reviews and average rating, so that I can judge its quality before booking.
7. As a Guest, I want to register an account, so that I can eventually create Bookings.
8. As a Guest, I want to complete Identity Verification by uploading my ID card or passport, so that the system can trust who I am.
9. As a foreign Guest, I want to verify with a passport instead of an ID card, so that guests from any Region can use the system.
10. As a Guest, I want my verification to be accepted immediately after uploading the document, so that I can book without waiting for an approval queue.
11. As a Guest, I want to log in, so that I can access my Bookings and take actions.
12. As a logged-in but unverified Guest, I want to be blocked from creating Bookings, so that only identity-verified guests can reserve.
13. As a Verified Guest, I want to create a Booking with a Room Type, number of guests, check-in date, and number of nights, so that I can reserve a stay.
14. As a Verified Guest, I want the system to not check room availability, so that I can book any Room Type freely.
15. As a Verified Guest, I want my Booking to identify the Hotel and its Region, so that I know exactly where I will stay.
16. As a Verified Guest, I want to view my own Bookings, so that I can track my upcoming and past stays.
17. As a Verified Guest, I want to cancel my Booking at any time with no rules, deadlines, or penalties, so that I can change my plans freely.
18. As a Verified Guest, I want my Booking data persisted in a database, so that my reservations are never lost.
19. As a Verified Guest, I want Bookings to reflect On-site Payment only, so that I know no online payment is required.
20. As a Verified Guest who completed an Actual Check-in at a Hotel, I want to submit a Review with a 0–5 star rating and an optional comment, so that I can share my real experience.
21. As a Verified Guest, I want to be blocked from reviewing a Hotel where I have not checked in, so that reviews cannot be spammed by people who never stayed.
22. As a reviewing Guest, I want one Review per Hotel that I can edit later, so that I can update my opinion when I change my mind.
23. As a Guest, I want the 0-star rating to be a valid choice, so that I can express the worst possible experience.
24. As Hotel Management, I want to mark a CONFIRMED Booking as an Actual Check-in, so that check-in statistics reflect reality.
25. As Hotel Management, I want total bookings statistics, so that I understand overall demand.
26. As Hotel Management, I want the most-booked Room Type statistic, so that I know which room categories are popular.
27. As Hotel Management, I want the most-booked Hotel statistic, so that I know which branches perform best.
28. As Hotel Management, I want the most-booked Region statistic, so that I know where the business is strongest.
29. As Hotel Management, I want the check-in percentage (Actual Check-ins ÷ total bookings), so that I can compare bookings against real arrivals.
30. As Hotel Management, I want management routes protected by a role check, so that Guests cannot mark check-ins or read statistics.
31. As the business owner, I want new Regions to be representable without code changes, so that expanding to new countries requires no re-architecture.
32. As the business owner, I want a seed of fake Regions, Hotels, Room Types, and images, so that the system is demonstrable without real data.
33. As Hotel Management, I want statistics computed on the server, so that clients never download raw Booking records to do the math themselves.

## Implementation Decisions

- **Stack**: ElysiaJS on Cloudflare Workers, TypeScript, Drizzle ORM over Supabase-hosted PostgreSQL (via the Supavisor transaction pooler on port 6543 — direct TCP from Workers is impossible), Better Auth for authentication, Cloudinary for image storage, Bun for tooling only.
- **Single app, two roles**: one API serves everyone. Users carry a role: `guest` or `management`. Management endpoints are guarded by role.
- **Catalog model**: `Region` (geographic area, uniquely named) → `Hotel` (one branch = one Hotel, belongs to one Region, holds name, description, and image references) → `Room Type` (belongs to a Hotel, holds name, description, maximum guest capacity, and image references). The catalog is seeded, not administered: there are no catalog CRUD endpoints.
- **Booking state machine** (exactly three statuses):

  ```text
  CONFIRMED ──▶ CANCELLED    (by the booking's Guest, no rules/deadlines)
  CONFIRMED ──▶ CHECKED_IN   (by Hotel Management; records the check-in timestamp)
  ```

  A Booking stores: the Guest, the Hotel, the Room Type, number of guests, check-in date, number of nights (check-out date is derived), status, and timestamps. There is no availability checking anywhere in the flow.
- **Identity Verification**: performed at registration. The Guest uploads an identity document image (Thai ID card or passport) with its document type; the backend uploads it to Cloudinary via signed upload and records the returned URL and public ID plus a verified timestamp. There is no approval queue. Booking and Review actions require a verified account.
- **Review rules**: rating is a required integer 0–5 (0 included); comment is optional text. The server rejects a review unless the Guest has a `CHECKED_IN` Booking at that Hotel. One Review per Guest per Hotel (unique constraint); a Guest edits their existing Review rather than creating a second.
- **Statistics** (all-time, computed in SQL on the server): total bookings (cancelled Bookings included in the denominator, matching the instructor's 100/80 → 80% example), Actual Check-ins, check-in percentage, and the most-booked Room Type, Hotel, and Region. No date-range filters.
- **Payments**: none in the system. On-site Payment only; no gateway, no price fields on Room Types (price was never in the requirements).
- **Seed data**: a script populates fake Regions, Hotels, Room Types, and demo images so the API is demonstrable end-to-end.
- **Domain language**: terminology follows `CONTEXT.md` (Guest, Hotel Management, Region, Hotel, Room Type, Booking, Cancellation, On-site Payment, Actual Check-in, Review, Identity Verification). An earlier idea of an ADR for "Bookings without dates" is obsolete — Bookings do carry a check-in date and nights.

## Testing Decisions

- **One seam**: tests exercise the HTTP API itself — the Elysia application object driven by `bun test` against a disposable database, seeding known fixtures first. Nothing below the HTTP boundary (no unit tests of internal helpers) is tested.
- **Good tests assert external behavior only**: request → response status code and JSON body. State machine transitions, gates, and statistics are all observable through the API, so no internal knowledge is needed.
- **Test suites**:
  - Booking lifecycle: create → cancel (allowed while `CONFIRMED`, rejected after); check-in by management (allowed while `CONFIRMED`, rejected after).
  - Review gate: no stay → rejected; after an Actual Check-in at that Hotel → accepted; a second review by the same Guest → rejected; rating bounds 0 and 5 accepted, −1 and 6 rejected.
  - Verification gate: unverified account cannot book; after uploading a document, booking succeeds.
  - Statistics math: with a seeded fixture of known bookings/check-ins, the returned totals, percentage, and most-booked Room Type/Hotel/Region are exact.
  - Access control: a `guest` role cannot reach management endpoints.
- **Prior art**: none — this is greenfield; these suites become the pattern for future tests.

## Out of Scope

- The frontend application (deliberately deferred; backend-first per the architecture document).
- Room prices, online payment, payment gateways, refunds.
- Room availability checking, in any form.
- Cancellation rules, deadlines, or penalties.
- Email notifications and any messaging.
- Catalog management UI/endpoints (catalog is seed data).
- Guest profile photos.
- Date-range filters on statistics; time-series reporting.
- External hotel onboarding, marketplace features, multi-owner support.
- Microservices decomposition.

## Further Notes

- Raw instructor requirements were re-collected and reconciled in-session; where the written `requirements.md` was ambiguous, the spoken requirements won (dates are required; verification is part of registration with immediate acceptance; reviews require an Actual Check-in).
- `CONTEXT.md` in the repo root is the authoritative glossary and has been updated to match these decisions (Booking now includes a check-in date; Review requires an Actual Check-in; Identity Verification is an ID card or passport upload; one branch = one Hotel).
- One deployment risk to de-risk early: Better Auth's session handling and Drizzle's pooler-based connection under the Cloudflare Workers runtime should be proven before building feature endpoints on top.
