#!/bin/bash

# YONE App Backup Script
# This script creates a complete backup of your project

echo "🔄 Starting YONE App Backup..."

# Get current date for backup folder
BACKUP_DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="/Users/abdulrahman/Desktop/YONE_Backups"
PROJECT_DIR="/Users/abdulrahman/yoneapp"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup folder with timestamp
BACKUP_FOLDER="$BACKUP_DIR/YONE_Backup_$BACKUP_DATE"
mkdir -p "$BACKUP_FOLDER"

echo "📁 Creating backup in: $BACKUP_FOLDER"

# Copy entire project
echo "📋 Copying project files..."
cp -r "$PROJECT_DIR" "$BACKUP_FOLDER/"

# Create database backup
echo "🗄️ Backing up MongoDB database..."
mkdir -p "$BACKUP_FOLDER/database_backup"
mongodump --db yoneapp --out "$BACKUP_FOLDER/database_backup/"

# Create Git bundle (complete version history)
echo "📦 Creating Git bundle..."
cd "$PROJECT_DIR"
git bundle create "$BACKUP_FOLDER/yoneapp_git_bundle.bundle" --all

# Create project summary
echo "📝 Creating project summary..."
cat > "$BACKUP_FOLDER/PROJECT_SUMMARY.txt" << EOF
YONE Learning Platform - Complete Backup
========================================

Backup Date: $BACKUP_DATE
Project Location: $PROJECT_DIR
Backup Location: $BACKUP_FOLDER

PROJECT FEATURES:
================
✅ Netflix-style loading screen
✅ Complete authentication system (login/register)
✅ 8-tab navigation (Home, Podcasts, Roadmaps, Articles, Advices, Terms, Top CV, More)
✅ Profile and Dashboard pages
✅ Enterprise-level security with rate limiting
✅ Admin system with user monitoring
✅ MongoDB database integration
✅ JWT authentication
✅ Account lockout protection
✅ Password security
✅ Admin dashboard API
✅ User management system

SECURITY FEATURES:
=================
✅ Rate limiting (5 auth attempts per 15 min)
✅ Account lockout after 5 failed attempts
✅ Password hashing with bcrypt
✅ JWT token security
✅ Input sanitization
✅ Security headers
✅ Admin authentication levels

ADMIN ACCESS:
============
Super Admin: admin@yoneapp.com
Password: SuperAdmin123! (CHANGE IMMEDIATELY!)

DATABASE:
=========
MongoDB Database: yoneapp
Collections: users, courses
Total Users: 4 (as of backup date)

HOW TO RESTORE:
===============
1. Copy the yoneapp folder to your desired location
2. Run: cd yoneapp && npm install
3. Run: cd backend && npm install
4. Copy .env file and update database connection
5. Run: ./start-server.sh
6. Restore database: mongorestore database_backup/

GIT RESTORATION:
===============
1. Create new directory: mkdir restored_project
2. Run: git clone yoneapp_git_bundle.bundle restored_project
3. All version history will be preserved

BACKUP CONTENTS:
===============
- Complete project source code
- All dependencies (package.json files)
- Database backup (MongoDB)
- Git version history
- Configuration files
- Documentation

This backup contains EVERYTHING needed to restore your project!
EOF

# Create restore instructions
cat > "$BACKUP_FOLDER/RESTORE_INSTRUCTIONS.md" << EOF
# 🔄 How to Restore Your YONE App

## Quick Restore (Same Computer)
1. Copy the \`yoneapp\` folder to your desired location
2. Open terminal and navigate to the project:
   \`\`\`bash
   cd /path/to/restored/yoneapp
   \`\`\`
3. Install dependencies:
   \`\`\`bash
   npm install
   cd backend && npm install
   \`\`\`
4. Set up environment:
   \`\`\`bash
   cd backend
   cp config.env.example .env
   # Edit .env with your database settings
   \`\`\`
5. Start the server:
   \`\`\`bash
   ./start-server.sh
   \`\`\`
6. Restore database:
   \`\`\`bash
   mongorestore database_backup/
   \`\`\`

## Restore on Different Computer
1. Install Node.js, MongoDB, and Git
2. Follow the same steps as above
3. Make sure MongoDB is running
4. Update database connection in .env file

## Restore Git History
\`\`\`bash
mkdir new_project
cd new_project
git clone ../yoneapp_git_bundle.bundle .
\`\`\`

## Verify Everything Works
1. Start backend: \`cd backend && ./start-server.sh\`
2. Start frontend: \`npm start\`
3. Test login with admin credentials
4. Check MongoDB Compass for data

Your project will be exactly as it was when backed up!
EOF

# Compress the backup
echo "🗜️ Compressing backup..."
cd "$BACKUP_DIR"
tar -czf "YONE_Backup_$BACKUP_DATE.tar.gz" "YONE_Backup_$BACKUP_DATE"

# Remove uncompressed folder to save space
rm -rf "YONE_Backup_$BACKUP_DATE"

echo "✅ Backup completed successfully!"
echo "📁 Backup location: $BACKUP_DIR/YONE_Backup_$BACKUP_DATE.tar.gz"
echo "📊 Backup size: $(du -h "$BACKUP_DIR/YONE_Backup_$BACKUP_DATE.tar.gz" | cut -f1)"
echo ""
echo "🎉 Your entire YONE project is now safely backed up!"
echo "💡 This backup includes:"
echo "   - All source code"
echo "   - Database backup"
echo "   - Git version history"
echo "   - Configuration files"
echo "   - Complete documentation"
echo ""
echo "🔄 To create another backup, run this script again."
