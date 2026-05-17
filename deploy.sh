#!/bin/bash
# =========================================================================
# CODEBRAWL MULTIPLAYER ARENA - AUTOMATED AWS EC2 DEPLOYMENT SCRIPT
# =========================================================================
set -e

echo "=== [1/5] Pulling Latest Protocol Archive ==="
git pull origin main

echo "=== [2/5] Copying Production Environment Configuration ==="
if [ ! -f .env ]; then
    echo "Creating .env from example template..."
    cp .env.example .env
    echo "Warning: Staging default secret keys. Replace all placeholders in .env for production compliance!"
fi

echo "=== [3/5] Cleaning Legacy Container Deployments ==="
docker compose down --remove-orphans

echo "=== [4/5] Building & Launching Microservices Stack ==="
docker compose up --build -d

echo "=== [5/5] Performing Active Orchestration Health Check ==="
sleep 8
docker compose ps

echo "========================================================================="
echo "CODEBRAWL MICROSERVICES ORCHESTRATION FULLY DEPLOYED & ONLINE!"
echo "========================================================================="
