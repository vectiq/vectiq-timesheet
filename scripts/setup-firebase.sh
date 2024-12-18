#!/bin/bash

# Exit on error
set -e

echo "🔥 Starting Firebase setup..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Install project dependencies
echo "📦 Installing dependencies..."
npm install

# Initialize Firestore rules and indexes
echo "📜 Deploying Firestore rules and indexes..."
firebase deploy --only firestore:rules,firestore:indexes

# Initialize database with collections and seed data
echo "🗄️ Setting up database collections..."
node --loader ts-node/esm scripts/setup-db.ts

# Build the web application
echo "🏗️ Building the application..."
npm run build

# Deploy to Firebase hosting
echo "🚀 Deploying to Firebase hosting..."
firebase deploy --only hosting

echo "
✅ Firebase setup completed successfully!

Next steps:
1. Sign in with the admin account:
   Email: admin@example.com
   (Set password through Firebase Console)

2. Start the development server:
   npm run dev

3. Start Firebase emulators (optional):
   npm run emulators
"