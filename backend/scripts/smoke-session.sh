#!/usr/bin/env bash
# Feedback loop: session bug on /identity-verification/signature
# Red = response contains "Failed to get session" (the user's exact symptom)
# Green = endpoint returns signed upload params
set -uo pipefail
BASE="${BASE:-http://localhost:8787}"
JAR=$(mktemp)
EMAIL="loop-$(date +%s)-$RANDOM@example.com"

SIGNUP=$(curl -s -c "$JAR" -X POST "$BASE/api/auth/sign-up/email" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Password123!\",\"name\":\"Loop User\"}")

if ! grep -q '"user"' <<<"$SIGNUP"; then
  echo "RED(setup): sign-up failed: $(echo "$SIGNUP" | head -c 300)"
  rm -f "$JAR"; exit 1
fi

RES=$(curl -s -b "$JAR" -X POST "$BASE/identity-verification/signature" \
  -H 'Content-Type: application/json' -d '{}')

rm -f "$JAR"

if grep -q 'Failed to get session' <<<"$RES"; then
  echo "RED: $RES"
  exit 1
fi

if grep -q 'signature' <<<"$RES"; then
  echo "GREEN: $(echo "$RES" | head -c 200)"
  exit 0
fi

echo "RED(other): $RES"
exit 1
