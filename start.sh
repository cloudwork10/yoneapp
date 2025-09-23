#!/bin/bash

# Set Node.js options to disable TypeScript stripping
export NODE_OPTIONS="--no-experimental-strip-types"

# Clear any existing processes
pkill -f expo 2>/dev/null || true

# Start Expo with proper options
echo "🚀 Starting YONE App..."
echo "📱 Disabling TypeScript stripping for compatibility..."

npx expo start --clear --no-dev --minify

echo "✅ App started successfully!"
