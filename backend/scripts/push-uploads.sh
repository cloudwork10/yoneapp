#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_URL="${API_URL:-https://yone-api-production-20e7.up.railway.app}"

if [[ -z "${ADMIN_TOKEN:-}" ]]; then
  echo "Usage: ADMIN_TOKEN=<admin-jwt> ./scripts/push-uploads.sh"
  echo "Optional: API_URL=https://your-api.example.com"
  exit 1
fi

if [[ ! -d "$ROOT/uploads" ]]; then
  echo "Missing folder: $ROOT/uploads"
  exit 1
fi

ZIP="/tmp/yone-uploads-$(date +%s)-$$.zip"
trap 'rm -f "$ZIP"' EXIT

echo "Zipping local uploads..."
(cd "$ROOT" && zip -rq "$ZIP" uploads)

echo "Uploading to $API_URL ..."
curl -sf -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "archive=@$ZIP" \
  "$API_URL/api/admin/storage/restore"

echo ""
echo "Done. Check: $API_URL/api/health"
