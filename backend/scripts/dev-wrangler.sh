#!/usr/bin/env bash
# Wrangler dev with env from .env (mirrors current-task.md Local dev instructions)
set -euo pipefail
cd "$(dirname "$0")/.."
set -a
source .env
set +a
export CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE="$SUPABASE_TX_URL"
exec bunx wrangler dev --port 8787
