#!/bin/bash

# Exit on error
set -e

# Build the project
echo "Building the project..."
npm run build

# Deploy Firestore rules and indexes
echo "Deploying Firestore configuration..."
firebase deploy --only firestore

# Deploy Firebase hosting
echo "Deploying to Firebase hosting..."
firebase deploy --only hosting

# Deploy Firebase functions (if you add them later)
# echo "Deploying Firebase functions..."
# firebase deploy --only functions

echo "Deployment completed successfully!"