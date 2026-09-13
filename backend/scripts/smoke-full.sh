#!/usr/bin/env bash
# Full happy-path smoke test against a running backend (wrangler dev or prod).
# Usage: BASE=http://localhost:8787 bash scripts/smoke-full.sh
set -uo pipefail
BASE="${BASE:-http://localhost:8787}"
DIR=$(mktemp -d)
EMAIL="smoke-$(date +%s)-$RANDOM@example.com"
fail() { echo "FAIL: $1"; exit 1; }

# 1. sign up guest
curl -s -m 60 -c "$DIR/guest.jar" -X POST "$BASE/api/auth/sign-up/email" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Password123!\",\"name\":\"Smoke Guest\"}" \
  | grep -q '"user"' || fail "sign-up"

# 2. signed upload params
SIG=$(curl -s -m 60 -b "$DIR/guest.jar" -X POST "$BASE/identity-verification/signature" \
  -H 'Content-Type: application/json' -d '{}')
CLOUD=$(jq -r .cloudName <<<"$SIG") || fail "signature endpoint"
APIKEY=$(jq -r .apiKey <<<"$SIG")
FOLDER=$(jq -r .folder <<<"$SIG")
TIMESTAMP=$(jq -r .timestamp <<<"$SIG")
SIGNATURE=$(jq -r .signature <<<"$SIG")
[ "$CLOUD" != "null" ] || fail "signature endpoint response"

# 3. upload dummy ID image to Cloudinary
printf 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' | base64 -d > "$DIR/id.png"
UPLOAD=$(curl -s -m 60 -X POST "https://api.cloudinary.com/v1_1/$CLOUD/image/upload" \
  -F "file=@$DIR/id.png" -F "api_key=$APIKEY" -F "timestamp=$TIMESTAMP" \
  -F "signature=$SIGNATURE" -F "folder=$FOLDER")
PUBLIC_ID=$(jq -r .public_id <<<"$UPLOAD")
[ "$PUBLIC_ID" != "null" ] || fail "cloudinary upload: $(echo "$UPLOAD" | head -c 300)"

# 4. verify identity
curl -s -m 60 -b "$DIR/guest.jar" -X POST "$BASE/identity-verification" \
  -H 'Content-Type: application/json' \
  -d "{\"documentType\":\"id_card\",\"publicId\":\"$PUBLIC_ID\"}" \
  | grep -q '"verified":true' || fail "identity verification"

# 5. pick first room type of first hotel
ROOM=$(curl -s -m 60 "$BASE/hotels/1")
HOTEL_ID=$(jq -r .id <<<"$ROOM")
ROOM_TYPE_ID=$(jq -r '.roomTypes[0].id' <<<"$ROOM")
[ "$ROOM_TYPE_ID" != "null" ] || fail "catalog"

# 6. create booking
BOOKING=$(curl -s -m 60 -b "$DIR/guest.jar" -X POST "$BASE/bookings" \
  -H 'Content-Type: application/json' \
  -d "{\"hotelId\":$HOTEL_ID,\"roomTypeId\":$ROOM_TYPE_ID,\"numGuests\":2,\"checkInDate\":\"2026-12-01\",\"nights\":3}")
BOOKING_ID=$(jq -r .id <<<"$BOOKING")
jq -r .status <<<"$BOOKING" | grep -q CONFIRMED || fail "booking: $(echo "$BOOKING" | head -c 300)"

# 7. management user (created + promoted by operator via SQL before this step)
curl -s -m 60 -c "$DIR/manager.jar" -X POST "$BASE/api/auth/sign-in/email" \
  -H 'Content-Type: application/json' \
  -d '{"email":"smoke-manager@example.com","password":"Password123!"}' \
  | grep -q '"user"' || fail "manager sign-in"

# 8. check-in
CHECKIN=$(curl -s -m 60 -b "$DIR/manager.jar" -X POST "$BASE/management/bookings/$BOOKING_ID/check-in")
jq -r .status <<<"$CHECKIN" | grep -q CHECKED_IN || fail "check-in: $(echo "$CHECKIN" | head -c 300)"

# 9. review
REVIEW=$(curl -s -m 60 -b "$DIR/guest.jar" -X POST "$BASE/hotels/$HOTEL_ID/reviews" \
  -H 'Content-Type: application/json' -d '{"rating":5,"message":"smoke test stay"}')
jq -r .rating <<<"$REVIEW" | grep -q 5 || fail "review: $(echo "$REVIEW" | head -c 300)"

# 10. stats
STATS=$(curl -s -m 60 -b "$DIR/manager.jar" "$BASE/management/stats")
jq -e '.totalBookings >= 1 and .actualCheckIns >= 1' <<<"$STATS" >/dev/null || fail "stats: $STATS"

echo "SMOKE_OK: booking=$BOOKING_ID hotel=$HOTEL_ID stats=$(echo "$STATS" | head -c 200)"
