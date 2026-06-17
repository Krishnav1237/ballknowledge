#!/bin/bash
# deploy-raspi.sh - Automated Deployment Script for Raspberry Pi 5
# Make sure to run: chmod +x deploy-raspi.sh

set -e # Exit immediately on error

echo "=== Starting Football Court Deployment ==="

# 1. Pull latest code
echo ">>> Pulling latest changes from git..."
git pull origin main || echo "Warning: git pull failed (continuing with local code)..."

# 2. Install dependencies
echo ">>> Installing dependencies..."
npm ci --omit=dev || npm install --production

# 3. Generate Prisma client
echo ">>> Running Prisma DB client generation..."
npx prisma generate

# 4. Run database migrations
echo ">>> Running PostgreSQL migrations..."
if [ -z "$DATABASE_URL" ]; then
  echo "Warning: DATABASE_URL environment variable is not set. Skipping migration deploy."
else
  npx prisma migrate deploy
fi

# 5. Build application
echo ">>> Building Next.js production app..."
npm run build

# 6. Restart server process
if command -v pm2 &> /dev/null; then
  echo ">>> PM2 found. Restarting PM2 process..."
  pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js
  pm2 save
elif systemctl is-active --quiet football-court; then
  echo ">>> systemd service found. Restarting football-court.service..."
  sudo systemctl restart football-court
else
  echo ">>> Server built successfully. Start manually using 'npm run start' or configure PM2/systemd."
fi

echo "=== Deployment Complete! ==="
