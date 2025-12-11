#!/bin/bash

# ============================================
# Pricing System - Automated Deployment Script
# ============================================

set -e  # Exit on error

echo "============================================"
echo "   Pricing System - Deployment Script"
echo "============================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root${NC}"
    exit 1
fi

# Update system
echo -e "${YELLOW}[1/8] Updating system...${NC}"
apt update && apt upgrade -y

# Install Docker
echo -e "${YELLOW}[2/8] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    echo "Docker already installed"
fi

# Install Docker Compose
echo -e "${YELLOW}[3/8] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    apt install docker-compose -y
else
    echo "Docker Compose already installed"
fi

# Install Nginx
echo -e "${YELLOW}[4/8] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
else
    echo "Nginx already installed"
fi

# Install Certbot
echo -e "${YELLOW}[5/8] Installing Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install certbot python3-certbot-nginx -y
else
    echo "Certbot already installed"
fi

# Check if project directory exists
PROJECT_DIR="/opt/pricing-system"
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}Project directory not found at $PROJECT_DIR${NC}"
    echo "Please upload the project first"
    exit 1
fi

cd $PROJECT_DIR

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}[6/8] Creating .env.production from example...${NC}"
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env.production
        echo -e "${YELLOW}⚠️  Please edit .env.production with your values!${NC}"
        echo "Press Enter to continue after editing..."
        read
    else
        echo -e "${RED}.env.production not found and no example file!${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}[6/8] .env.production found${NC}"
fi

# Start services
echo -e "${YELLOW}[7/8] Starting services...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Wait for services
echo "Waiting for services to be ready (15 seconds)..."
sleep 15

# Check services status
echo -e "${YELLOW}[8/8] Checking services status...${NC}"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}============================================"
echo "   ✅ Deployment Complete!"
echo "============================================${NC}"
echo ""
echo "Next steps:"
echo "1. Configure DNS to point to this server's IP"
echo "2. Run: certbot --nginx -d your-domain.com"
echo "3. Test: https://your-domain.com"
echo ""



