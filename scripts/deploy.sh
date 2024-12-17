#!/bin/bash

# Build and push Docker images
docker-compose build
docker-compose push

# Deploy to production server
ssh user@your-server.com "cd /app && \
  docker-compose pull && \
  docker-compose up -d"