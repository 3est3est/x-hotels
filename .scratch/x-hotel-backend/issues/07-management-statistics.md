# 07: Management statistics

**What to build:** Hotel Management reads all-time statistics from a single endpoint: total Bookings (cancelled Bookings included in the denominator, matching the instructor's 100/80 → 80% example), Actual Check-ins, the check-in percentage, and the most-booked Room Type, Hotel, and Region. All math happens in SQL on the server — clients never download raw Booking records.

**Blocked by:** 05 (Actual Check-in)

**Status:** ready-for-agent

- [ ] `GET /admin/stats` returns totals, Actual Check-ins, check-in percentage, and most-booked Room Type / Hotel / Region
- [ ] Aggregates computed in the database, not in application code over fetched rows
- [ ] Management route guard rejects `guest`-role accounts
- [ ] Tests: with a seeded fixture of known Bookings and check-ins, every returned number and the percentage are exact
