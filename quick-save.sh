#!/bin/bash

# Quick Save Script for YONE App
# Run this every time you make changes

echo "💾 Quick Save - YONE App"
echo "========================"

# Navigate to project directory
cd /Users/abdulrahman/yoneapp

# Check git status
echo "📋 Checking changes..."
git status

# Add all changes
echo "➕ Adding all changes..."
git add .

# Get current date for commit message
DATE=$(date +"%Y-%m-%d %H:%M:%S")

# Commit with timestamp
echo "💾 Saving changes..."
git commit -m "Quick save - $DATE"

# Show commit info
echo "✅ Changes saved successfully!"
echo "📅 Saved at: $DATE"

# Show recent commits
echo ""
echo "📜 Recent saves:"
git log --oneline -5

echo ""
echo "🎉 Your work is now safely saved!"
echo "💡 To create full backup, run: ./backup-project.sh"
