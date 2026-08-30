# 05: Actual Check-in

**What to build:** Hotel Management can mark a CONFIRMED Booking as an Actual Check-in when the Guest arrives, recording the check-in timestamp. Guests cannot mark check-ins themselves; only the `management` role can reach this route. This is the recording step that later powers the check-in percentage and Review gate.

**Blocked by:** 04 (Booking lifecycle)

**Status:** ready-for-agent

- [ ] `POST /admin/bookings/:id/check-in` moves a CONFIRMED Booking to CHECKED_IN and records the check-in timestamp
- [ ] Rejects check-in on a CANCELLED or already CHECKED_IN Booking
- [ ] Management route guard rejects `guest`-role accounts
- [ ] Tests: management check-in succeeds; guest-role rejection; double check-in rejection; check-in after cancellation rejection
