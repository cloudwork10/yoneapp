#!/bin/bash
echo "🔄 إعادة تشغيل الـ Backend..."

# أوقف الـ backend الحالي
echo "⏹️  إيقاف الـ backend..."
pkill -f "node server.js" 2>/dev/null
sleep 2

# أعد تشغيله
echo "🚀 تشغيل الـ backend..."
cd /Users/abdulrahman/Desktop/yoneapp/backend
nohup node server.js > server.log 2>&1 &
BACKEND_PID=$!

sleep 3

# تحقق من أنه يعمل
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ الـ backend يعمل الآن (PID: $BACKEND_PID)"
    echo "📝 Logs: tail -f backend/server.log"
else
    echo "❌ فشل تشغيل الـ backend. تحقق من backend/server.log"
fi
