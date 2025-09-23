#!/bin/bash

echo "🔧 Attempting to use Node.js 20 for compatibility..."

# Try to use Node.js 20 if available
if command -v nvm &> /dev/null; then
    echo "📦 Using nvm to switch to Node.js 20..."
    nvm use 20
elif command -v n &> /dev/null; then
    echo "📦 Using n to switch to Node.js 20..."
    n 20
else
    echo "⚠️  nvm or n not found, using current Node.js version"
fi

echo "🚀 Starting YONE App with Node.js $(node --version)..."

# Clear any existing processes
pkill -f expo 2>/dev/null || true

# Start Expo
npx expo start --clear

echo "✅ App started!"
