#!/usr/bin/env bash
set -euo pipefail

API_URL="https://yone-api-production-20e7.up.railway.app"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EMAIL="${ADMIN_EMAIL:-admin@yoneapp.com}"

echo "============================================"
echo "  رفع ملفات yoneapp على البرودكشن (مرة واحدة)"
echo "============================================"
echo ""

if [[ ! -d "$ROOT/uploads" ]]; then
  echo "❌ مجلد الملفات مش موجود: $ROOT/uploads"
  exit 1
fi

echo "⏳ جاري التحقق من السيرفر..."
HEALTH="$(curl -sf "$API_URL/api/health" || true)"
if [[ -z "$HEALTH" ]]; then
  echo "❌ السيرفر مش شغال: $API_URL"
  exit 1
fi

if ! echo "$HEALTH" | grep -q '"uploads"'; then
  echo "❌ الكود الجديد لسه مش deployed على Railway."
  echo "   استنى 2-3 دقائق بعد push GitHub وجرب تاني."
  echo "   أو افتح Railway → yone-api → Deployments وتأكد آخر deploy نجح."
  exit 1
fi

echo "✅ السيرفر شغال والكود الجديد deployed"
echo ""

if [[ -z "${ADMIN_TOKEN:-}" ]]; then
  if [[ -z "${ADMIN_PASSWORD:-}" ]]; then
    read -rsp "🔑 كلمة سر الأدمن ($EMAIL): " ADMIN_PASSWORD
    echo ""
  fi

  echo "⏳ تسجيل الدخول..."
  LOGIN_RESPONSE="$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")"

  ADMIN_TOKEN="$(node -e "
    const r = JSON.parse(process.argv[1]);
    const t =
      r.data?.tokens?.accessToken ||
      r.tokens?.accessToken ||
      r.token ||
      r.data?.token;
    if (!t) {
      console.error(r.message || 'Login failed');
      process.exit(1);
    }
    console.log(t);
  " "$LOGIN_RESPONSE")" || {
    echo "❌ فشل تسجيل الدخول — تأكد من الإيميل وكلمة السر"
    echo "   الافتراضي: admin@yoneapp.com / SuperAdmin123!"
    exit 1
  }
fi

ZIP="/tmp/yone-uploads-$(date +%s)-$$.zip"
trap 'rm -f "$ZIP"' EXIT

echo "⏳ ضغط الملفات..."
(cd "$ROOT" && zip -rq "$ZIP" uploads) || {
  echo "❌ فشل ضغط الملفات"
  exit 1
}

SIZE="$(du -h "$ZIP" | cut -f1)"
echo "⏳ رفع $SIZE على البرودكشن..."

RESULT="$(curl -sf -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "archive=@$ZIP" \
  "$API_URL/api/admin/storage/restore")"

echo ""
echo "✅ تم بنجاح!"
echo "$RESULT" | node -e "
  const r = JSON.parse(require('fs').readFileSync(0,'utf8'));
  console.log('   ملفات اترفعت:', r.restored ?? '?');
  console.log('   إجمالي على السيرفر:', r.total ?? r.totalFiles ?? '?');
"
echo ""
echo "🎉 خلاص — أي محتوى جديد من التطبيق هيفضل على البرودكشن للأبد."
echo "   تحقق: $API_URL/api/health"
