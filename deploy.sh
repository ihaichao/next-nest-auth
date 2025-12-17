#!/bin/bash

# Next-Nest-Auth VPS Deployment Script

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting deployment for Next-Nest-Auth...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    echo "Visit: https://docs.docker.com/engine/install/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check for .env file
if [ ! -f .env ]; then
    echo -e "${BLUE}📝 Creating .env file from example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}Created .env file. Please edit it with your production secrets!${NC}"
        echo -e "${RED}IMPORTANT: You must edit .env before proceeding!${NC}"
        read -p "Press Enter to continue after editing .env (or Ctrl+C to stop)..."
    else
        echo -e "${RED}.env.example not found!${NC}"
        exit 1
    fi
fi

# Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker compose down

# Build and start services
echo -e "${BLUE}🏗️ Building and starting services...${NC}"
docker compose up -d --build

# Check health
echo -e "${BLUE}🏥 Checking service health...${NC}"
sleep 10
if docker compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${BLUE}Services are defined as:${NC}"
    docker compose ps
    echo ""
    echo -e "Frontend: http://localhost:3000 (or your VPS IP)"
    echo -e "Backend:  http://localhost:4000"
else
    echo -e "${RED}❌ Deployment failed. Check logs with 'docker compose logs'${NC}"
fi
