#!/usr/bin/env bash
# Full happy-path smoke test against a running backend (bun dev, wrangler dev or prod).
# Identity Verification is a document number — nothing is uploaded (ADR 0002).
# Usage: BASE=http://localhost:3000 bash scripts/smoke-full.sh
# Needs a promoted `smoke-manager@example.com` account (operator creates it via
# sign-up + SQL role promotion before this script runs).
set -uo pipefail
BASE="${BASE:-http://localhost:3000}"
DIR=$(mktemp -d)
EMAIL="smoke-$(date +%s)-$RANDOM@example.com"
fail() { echo "FAIL: $1"; exit 1; }

# 1. sign up guest
curl -s -m 60 -c "$DIR/guest.jar" -X POST "$BASE/api/auth/sign-up/email" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Password123!\",\"name\":\"Smoke Guest\"}" \
  | grep -q '"user"' || fail "sign-up"

# 2. Countries with nested Regions (anonymous)
COUNTRIES=$(curl -s -m 60 "$BASE/countries")
jq -e 'type == "array" and length >= 1 and (.[] | has("regions"))' <<<"$COUNTRIES" >/dev/null \
  || fail "countries: $(echo "$COUNTRIES" | head -c 300)"

# 3. verify by document number — Thai national ID, mod-11 check digit
curl -s -m 60 -b "$DIR/guest.jar" -X POST "$BASE/identity-verification" \
  -H 'Content-Type: application/json' \
  -d '{"documentType":"id_card","documentNumber":"1234567890121"}' \
  | grep -q '"verified":true' || fail "identity verification"

# 4. first hotel detail — names its Region and Country
HOTEL=$(curl -s -m 60 "$BASE/hotels/1")
HOTEL_ID=$(jq -r .id <<<"$HOTEL")
ROOM_TYPE_ID=$(jq -r '.roomTypes[0].id' <<<"$HOTEL")
jq -e '.regionName and .countryName' <<<"$HOTEL" >/dev/null \
  || fail "hotel detail: $(echo "$HOTEL" | head -c 300)"
[ "$ROOM_TYPE_ID" != "null" ] || fail "catalog"

# 5. create booking — the single representation names the Country
BOOKING=$(curl -s -m 60 -b "$DIR/guest.jar" -X POST "$BASE/bookings" \
  -H 'Content-Type: application/json' \
  -d "{\"hotelId\":$HOTEL_ID,\"roomTypeId\":$ROOM_TYPE_ID,\"numGuests\":2,\"checkInDate\":\"2026-12-01\",\"nights\":3}")
BOOKING_ID=$(jq -r .id <<<"$BOOKING")
jq -r .status <<<"$BOOKING" | grep -q CONFIRMED || fail "booking: $(echo "$BOOKING" | head -c 300)"
jq -r .countryName <<<"$BOOKING" | grep -q . || fail "booking country: $(echo "$BOOKING" | head -c 300)"

# 6. management user (created + promoted by operator via SQL before this step)
curl -s -m 60 -c "$DIR/manager.jar" -X POST "$BASE/api/auth/sign-in/email" \
  -H 'Content-Type: application/json' \
  -d '{"email":"smoke-manager@example.com","password":"Password123!"}' \
  | grep -q '"user"' || fail "manager sign-in"

# 7. check-in
CHECKIN=$(curl -s -m 60 -b "$DIR/manager.jar" -X POST "$BASE/management/bookings/$BOOKING_ID/check-in")
jq -r .status <<<"$CHECKIN" | grep -q CHECKED_IN || fail "check-in: $(echo "$CHECKIN" | head -c 300)"

# 8. review
REVIEW=$(curl -s -m 60 -b "$DIR/guest.jar" -X POST "$BASE/hotels/$HOTEL_ID/reviews" \
  -H 'Content-Type: application/json' -d '{"rating":5,"message":"smoke test stay"}')
jq -r .rating <<<"$REVIEW" | grep -q 5 || fail "review: $(echo "$REVIEW" | head -c 300)"

# 9. stats — most-booked Country included
STATS=$(curl -s -m 60 -b "$DIR/manager.jar" "$BASE/management/stats")
jq -e '.totalBookings >= 1 and .actualCheckIns >= 1 and .mostBookedCountry.name != null' <<<"$STATS" >/dev/null \
  || fail "stats: $STATS"

echo "SMOKE_OK: booking=$BOOKING_ID hotel=$HOTEL_ID stats=$(echo "$STATS" | head -c 200)"
