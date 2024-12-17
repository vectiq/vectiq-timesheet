#!/bin/bash

# Exit on error
set -e

# Check if service account file exists
if [ ! -f "firebase-service-account.json" ]; then
    echo "Error: firebase-service-account.json not found"
    exit 1
fi

# Build the project
npm run build

# Deploy using service account
firebase deploy --only hosting --json --token "$(cat firebase-service-account.json | jq -r '.token')"