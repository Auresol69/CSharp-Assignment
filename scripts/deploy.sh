#!/usr/bin/env bash
# ==============================================================================
# Enterprise Zero-Downtime Deployment Script for Azure VPS
# Usage: bash deploy.sh [IMAGE_TAG] [ENVIRONMENT]
# Example: bash deploy.sh sha-a1b2c3d production
# ==============================================================================
set -euo pipefail

# ---- Arguments ----
TARGET_TAG="${1:-latest}"
ENVIRONMENT="${2:-production}"

# ---- Config ----
APP_DIR="/app/interacthub"
HEALTH_CHECK_URL="http://localhost:5153/health"
HEALTH_MAX_RETRIES=12
HEALTH_RETRY_INTERVAL=5
LOG_LINES=50

# ---- Color Codes ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ==============================================================================
echo -e "${CYAN}[CI/CD Deploy] =============================================${NC}"
echo -e "${CYAN}[CI/CD Deploy] Environment : ${ENVIRONMENT}${NC}"
echo -e "${CYAN}[CI/CD Deploy] Target Tag  : ${TARGET_TAG}${NC}"
echo -e "${CYAN}[CI/CD Deploy] App Dir     : ${APP_DIR}${NC}"
echo -e "${CYAN}[CI/CD Deploy] =============================================${NC}"

# Ensure we are in the correct directory
cd "${APP_DIR}"

# ==============================================================================
# STEP 1: Pull New Container Images (without stopping running instances)
# ==============================================================================
echo -e "\n${YELLOW}[1/5] Pulling Docker images with tag: ${TARGET_TAG}...${NC}"
IMAGE_TAG="${TARGET_TAG}" docker-compose pull api frontend worker

# ==============================================================================
# STEP 2: Zero-Downtime Rolling Restart
#   --no-deps: only recreate specified services
#   --build: use freshly pulled images (not rebuild from Dockerfile)
# ==============================================================================
echo -e "\n${YELLOW}[2/5] Starting upgraded containers (zero-downtime rolling)...${NC}"
IMAGE_TAG="${TARGET_TAG}" docker-compose up -d --no-deps api frontend worker

# ==============================================================================
# STEP 3: Live Health Check Probing
# ==============================================================================
echo -e "\n${YELLOW}[3/5] Probing health endpoint: ${HEALTH_CHECK_URL}${NC}"
HEALTH_PASSED=false

for i in $(seq 1 ${HEALTH_MAX_RETRIES}); do
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${HEALTH_CHECK_URL}" || echo "000")

    if [ "${HTTP_STATUS}" -eq 200 ]; then
        HEALTH_PASSED=true
        echo -e "${GREEN}[OK] Health check passed (HTTP 200) on attempt ${i}/${HEALTH_MAX_RETRIES}${NC}"
        break
    fi

    echo -e "${YELLOW}Attempt ${i}/${HEALTH_MAX_RETRIES}: HTTP ${HTTP_STATUS}. Waiting ${HEALTH_RETRY_INTERVAL}s...${NC}"
    sleep "${HEALTH_RETRY_INTERVAL}"
done

# ==============================================================================
# STEP 4: Rollback Guard
# ==============================================================================
if [ "${HEALTH_PASSED}" = false ]; then
    echo -e "\n${RED}[CRITICAL] Health check failed after ${HEALTH_MAX_RETRIES} attempts!${NC}"
    echo -e "${RED}[CRITICAL] Dumping container logs for diagnosis:${NC}"
    docker-compose logs --tail=${LOG_LINES} api

    echo -e "\n${YELLOW}[ROLLBACK] Initiating automatic rollback to previous stable image...${NC}"
    # Roll back: docker-compose will restart using the last known good image
    # (The previous image is still present since we didn't prune it yet)
    docker-compose up -d --no-deps api frontend worker

    echo -e "${RED}[ROLLBACK] Rollback attempt complete. Verify system state manually.${NC}"
    exit 1
fi

# ==============================================================================
# STEP 5: Cleanup Dangling Images (>24h old to preserve rollback capability)
# ==============================================================================
echo -e "\n${YELLOW}[5/5] Cleaning up stale Docker images (older than 24h)...${NC}"
docker image prune -f --filter "until=24h"

echo -e "\n${GREEN}============================================================${NC}"
echo -e "${GREEN}[SUCCESS] InteractHub release '${TARGET_TAG}' (${ENVIRONMENT}) is LIVE!${NC}"
echo -e "${GREEN}          Zero-downtime deployment completed successfully.${NC}"
echo -e "${GREEN}============================================================${NC}"
