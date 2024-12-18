#!/bin/sh

# Exit immediately if any command fails
set -e

echo "Starting Firebase setup..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Deploy Firestore rules
echo "Deploying Firestore rules..."
firebase deploy --only firestore:rules

# Deploy Firestore indexes
echo "Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

# Initialize database
echo "Initializing database..."
node --loader ts-node/esm scripts/init-db.ts

# Build the application
echo "Building the application..."
npm run build

# Deploy to hosting
echo "Deploying to Firebase hosting..."
firebase deploy --only hosting

echo "Setup completed successfully!"