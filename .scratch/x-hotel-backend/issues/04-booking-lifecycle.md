# 04: Booking lifecycle

**What to build:** A verified Guest creates a Booking — Hotel, Room Type, number of guests, check-in date, number of nights — with no availability checking. They can list and view their own Bookings and cancel their own CONFIRMED Booking at any time with no rules or penalties. Booking data persists in PostgreSQL. On-site Payment only: nothing in the flow asks for payment.

**Blocked by:** 02 (Catalog — Region, Hotel, Room Type), 03 (Better Auth + Identity Verification)

**Status:** ready-for-agent

- [ ] Booking schema: Guest, Hotel, Room Type, number of guests, check-in date, nights (check-out derived), status, timestamps
- [ ] `POST /bookings` creates a CONFIRMED Booking; rejects unverified accounts, bad guest counts (above Room Type capacity or below 1), and nights below 1
- [ ] `GET /bookings` and `GET /bookings/:id` return only the caller's own Bookings
- [ ] `POST /bookings/:id/cancel` moves own CONFIRMED Booking to CANCELLED; rejects other people's Bookings
- [ ] Tests: create → cancel lifecycle; unverified rejection; ownership rejection; validation rejections
