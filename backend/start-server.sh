#!/bin/bash

# Kill any existing processes on port 3000
echo "🔄 Stopping any existing server processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Wait a moment
sleep 2

# Start the server
echo "🚀 Starting YONE Backend Server..."
echo "📱 Server will run on: http://localhost:3000"
echo "📊 Health check: http://localhost:3000/api/health"
echo ""

# Start server in background with logging
nohup node server.js > server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Check if server is running
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Server started successfully!"
    echo "🆔 Process ID: $SERVER_PID"
    echo "📝 Logs: tail -f server.log"
    echo ""
    echo "🎉 Your backend is ready!"
    echo "💡 To stop: kill $SERVER_PID"
else
    echo "❌ Server failed to start. Check server.log for errors."
    exit 1
fi
