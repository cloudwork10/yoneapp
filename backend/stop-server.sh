#!/bin/bash

echo "🛑 Stopping YONE Backend Server..."

# Kill processes on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Kill any node server processes
pkill -f "node server.js" 2>/dev/null || true

echo "✅ Server stopped successfully!"
echo "💡 To start again: ./start-server.sh"
