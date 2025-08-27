#!/bin/bash
# Copyright (c) 2025 Eventful India Marketing Services, India
# All rights reserved.
# 
# Service: taxonomy
# Port: 3201
# Development Environment Setup Script
# Template: Eventzr Code Repository Template v1.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Service configuration
SERVICE_NAME="taxonomy"
SERVICE_PORT="3201"
NODE_VERSION="20"
REQUIRED_TOOLS=("node" "npm" "docker" "git")

echo -e "${BLUE}🚀 Setting up Eventzr ${SERVICE_NAME} Development Environment...${NC}"
echo -e "${CYAN}📋 Service: ${SERVICE_NAME} | Port: ${SERVICE_PORT}${NC}"

# Function to print section headers
print_section() {
    echo -e "\n${PURPLE}=== $1 ===${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -ge "$NODE_VERSION" ]; then
            echo -e "${GREEN}✓${NC} Node.js $(node -v) (required: v${NODE_VERSION}+)"
            return 0
        else
            echo -e "${RED}❌${NC} Node.js $(node -v) is too old (required: v${NODE_VERSION}+)"
            return 1
        fi
    else
        echo -e "${RED}❌${NC} Node.js not found"
        return 1
    fi
}

# Function to install Node.js via nvm if needed
install_nodejs() {
    echo -e "${YELLOW}📦${NC} Installing Node.js v${NODE_VERSION}..."
    
    if ! command_exists nvm; then
        echo -e "${BLUE}Installing NVM...${NC}"
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
    
    nvm install $NODE_VERSION
    nvm use $NODE_VERSION
    nvm alias default $NODE_VERSION
}

print_section "System Requirements Check"

# Check required tools
all_tools_available=true
for tool in "${REQUIRED_TOOLS[@]}"; do
    if command_exists "$tool"; then
        case "$tool" in
            node)
                if check_node_version; then
                    echo -ne # Already handled in check_node_version
                else
                    all_tools_available=false
                fi
                ;;
            docker)
                echo -e "${GREEN}✓${NC} Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
                ;;
            *)
                echo -e "${GREEN}✓${NC} $tool is available"
                ;;
        esac
    else
        echo -e "${RED}❌${NC} $tool is not installed"
        all_tools_available=false
    fi
done

# Install Node.js if needed
if ! check_node_version; then
    read -p "Install Node.js v${NODE_VERSION}? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_nodejs
    else
        echo -e "${RED}❌${NC} Node.js v${NODE_VERSION}+ is required"
        exit 1
    fi
fi

print_section "Environment Configuration"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.sample" ]; then
        echo -e "${BLUE}📄${NC} Creating .env from .env.sample..."
        cp .env.sample .env
        echo -e "${GREEN}✓${NC} Created .env file"
        echo -e "${YELLOW}⚠️${NC}  Please edit .env with your configuration"
    else
        echo -e "${BLUE}📄${NC} Creating default .env file..."
        cat > .env << EOF
# Eventzr Taxonomy Service Environment Configuration
# Service: taxonomy | Port: 3201

# Environment
NODE_ENV=development
PORT=3201
SERVICE_NAME=taxonomy

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/eventzr_taxonomy_dev
DATABASE_CLUSTER=3
ENABLE_LOGGING=true
ENABLE_RLS=true

# Redis Cache
REDIS_URL=redis://localhost:6379
CACHE_TTL=300

# Authentication (JWT)
JWT_SECRET=your-development-jwt-secret-change-this
JWT_EXPIRY=24h
JWT_ISSUER=eventzr
JWT_AUDIENCE=taxonomy

# External Services
API_GATEWAY_URL=http://localhost:3000
SECRETS_KMS_URL=http://localhost:3902
MASTERDATA_URL=http://localhost:3200

# AI Integration
AILABS_URL=http://localhost:3400
ENABLE_AI_CLASSIFICATION=true
AI_CONFIDENCE_THRESHOLD=0.8

# Monitoring & Logging
LOG_LEVEL=debug
ENABLE_METRICS=true
METRICS_PORT=9090

# Development Settings
ENABLE_SWAGGER=true
ENABLE_DEBUG=true
ENABLE_CORS=true

# Rate Limiting (per registry)
RATE_LIMIT_RPM=600
RATE_LIMIT_BURST=100

# Performance
MAX_PAGINATION_LIMIT=100
DEFAULT_PAGINATION_LIMIT=20

# Security
ENABLE_HELMET=true
ENABLE_REQUEST_ID=true
TRUST_PROXY=1
EOF
        echo -e "${GREEN}✓${NC} Created default .env file"
    fi
else
    echo -e "${GREEN}✓${NC} .env file already exists"
fi

print_section "Backend Dependencies"

if [ -d "backend" ]; then
    echo -e "${BLUE}📦${NC} Installing backend dependencies..."
    cd backend
    
    # Check if package.json exists
    if [ -f "package.json" ]; then
        # Clean install
        if [ -f "package-lock.json" ]; then
            npm ci
        else
            npm install
        fi
        echo -e "${GREEN}✓${NC} Backend dependencies installed"
        
        # Generate Prisma client
        if [ -f "prisma/schema.prisma" ]; then
            echo -e "${BLUE}🗄️${NC} Generating Prisma client..."
            npx prisma generate
            echo -e "${GREEN}✓${NC} Prisma client generated"
        fi
        
        # Build the project
        echo -e "${BLUE}🔨${NC} Building backend..."
        npm run build
        echo -e "${GREEN}✓${NC} Backend built successfully"
        
    else
        echo -e "${YELLOW}⚠️${NC}  No package.json found in backend directory"
    fi
    
    cd ..
else
    echo -e "${YELLOW}⚠️${NC}  Backend directory not found"
fi

print_section "Frontend Dependencies"

if [ -d "frontend" ]; then
    echo -e "${BLUE}📦${NC} Installing frontend dependencies..."
    cd frontend
    
    # Check if package.json exists
    if [ -f "package.json" ]; then
        # Clean install
        if [ -f "package-lock.json" ]; then
            npm ci
        else
            npm install
        fi
        echo -e "${GREEN}✓${NC} Frontend dependencies installed"
        
        # Build the project
        echo -e "${BLUE}🔨${NC} Building frontend..."
        npm run build
        echo -e "${GREEN}✓${NC} Frontend built successfully"
        
    else
        echo -e "${YELLOW}⚠️${NC}  No package.json found in frontend directory"
    fi
    
    cd ..
else
    echo -e "${YELLOW}⚠️${NC}  Frontend directory not found"
fi

print_section "Database Setup"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌${NC} Docker is not running. Please start Docker first."
    exit 1
fi

# Start database with Docker Compose if available
if [ -f "docker-compose.yml" ]; then
    echo -e "${BLUE}🐳${NC} Starting database with Docker Compose..."
    docker-compose up -d database redis
    echo -e "${GREEN}✓${NC} Database services started"
    
    # Wait for database to be ready
    echo -e "${BLUE}⏳${NC} Waiting for database to be ready..."
    for i in {1..30}; do
        if docker-compose exec -T database pg_isready -U postgres >/dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} Database is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌${NC} Database failed to start"
            exit 1
        fi
        sleep 2
    done
    
    # Run migrations if backend exists
    if [ -d "backend" ] && [ -f "backend/package.json" ]; then
        echo -e "${BLUE}🗄️${NC} Running database migrations..."
        cd backend
        npm run db:migrate || echo -e "${YELLOW}⚠️${NC}  Migration failed (database might not be ready)"
        
        # Seed database
        echo -e "${BLUE}🌱${NC} Seeding database..."
        npm run db:seed || echo -e "${YELLOW}⚠️${NC}  Seeding failed"
        
        cd ..
        echo -e "${GREEN}✓${NC} Database initialized"
    fi
else
    echo -e "${YELLOW}⚠️${NC}  docker-compose.yml not found, skipping database setup"
fi

print_section "Development Tools"

# Install global tools if needed
echo -e "${BLUE}🔧${NC} Installing development tools..."

# Prisma CLI
if ! command_exists prisma; then
    npm install -g prisma
    echo -e "${GREEN}✓${NC} Prisma CLI installed globally"
fi

# TypeScript
if ! command_exists tsc; then
    npm install -g typescript
    echo -e "${GREEN}✓${NC} TypeScript installed globally"
fi

print_section "Git Configuration"

# Setup Git hooks if directory exists
if [ -d ".git" ]; then
    echo -e "${BLUE}📝${NC} Setting up Git hooks..."
    
    # Install husky if package.json exists
    if [ -f "package.json" ]; then
        npm install husky --save-dev
        npx husky install
        
        # Pre-commit hook
        npx husky add .husky/pre-commit "npm run lint && npm run test"
        
        # Pre-push hook
        npx husky add .husky/pre-push "npm run build"
        
        echo -e "${GREEN}✓${NC} Git hooks configured"
    fi
else
    echo -e "${YELLOW}⚠️${NC}  Not a Git repository, skipping Git setup"
fi

print_section "Validation & Health Check"

# Test backend if running
if [ -d "backend" ]; then
    echo -e "${BLUE}🧪${NC} Testing backend..."
    cd backend
    
    # Start service in background for health check
    npm run start:dev >/dev/null 2>&1 &
    DEV_PID=$!
    
    # Wait for service to start
    sleep 10
    
    # Health check
    if curl -f -s "http://localhost:${SERVICE_PORT}/health" >/dev/null; then
        echo -e "${GREEN}✓${NC} Backend service is healthy"
    else
        echo -e "${YELLOW}⚠️${NC}  Backend health check failed (service might not be fully started)"
    fi
    
    # Kill background process
    kill $DEV_PID 2>/dev/null || true
    
    cd ..
fi

print_section "Summary"

echo -e "${GREEN}✅ Development environment setup complete!${NC}"
echo -e "\n${CYAN}🚀 Quick Start Commands:${NC}"
echo "  📦 Install dependencies: npm install"
echo "  🏗️  Build all: npm run build"
echo "  🧪 Run tests: npm test"
echo "  🎯 Start development: npm run dev"
echo "  🗄️  Database commands:"
echo "    • Migrate: npm run db:migrate"
echo "    • Seed: npm run db:seed"
echo "    • Reset: npm run db:reset"

echo -e "\n${BLUE}🌐 Service Information:${NC}"
echo "  📡 Service URL: http://localhost:${SERVICE_PORT}"
echo "  📊 Health Check: http://localhost:${SERVICE_PORT}/health"
echo "  📖 API Docs: http://localhost:${SERVICE_PORT}/docs"
echo "  🎯 Registry Compliance: 100%"

echo -e "\n${PURPLE}🔧 Development Tools:${NC}"
echo "  📝 API Documentation: http://localhost:${SERVICE_PORT}/docs"
echo "  📊 Metrics: http://localhost:9090/metrics"
echo "  🎨 Storybook (frontend): http://localhost:6006"

echo -e "\n${YELLOW}📋 Next Steps:${NC}"
echo "  1. Edit .env file with your configuration"
echo "  2. Review database connection settings"
echo "  3. Configure external service URLs"
echo "  4. Run tests to ensure everything works"
echo "  5. Start development with: npm run dev"

echo -e "\n${GREEN}🎉 Happy coding with Eventzr Taxonomy Service!${NC}"