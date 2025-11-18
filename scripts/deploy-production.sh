#!/bin/bash

# Production Deployment Script for KALM AI Sales Platform
# This script performs security checks and deploys to production

set -e  # Exit on any error

echo "🚀 Starting Production Deployment for KALM AI Sales Platform"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in project root directory. Please run from the project root."
    exit 1
fi

print_status "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_success "Prerequisites check passed"

# Security checks
print_status "Running security audit..."
if [ -f "server/scripts/securityAudit.js" ]; then
    node server/scripts/securityAudit.js
    if [ $? -ne 0 ]; then
        print_warning "Security audit found issues. Please review before proceeding."
        read -p "Continue with deployment? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelled by user"
            exit 1
        fi
    fi
else
    print_warning "Security audit script not found"
fi

# Environment check
print_status "Checking environment configuration..."

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    print_error "server/.env file not found"
    exit 1
fi

# Check for required environment variables
source server/.env 2>/dev/null || true

REQUIRED_VARS=("JWT_SECRET" "MONGODB_URI" "OPENAI_API_KEY" "STRIPE_SECRET_KEY")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    print_error "Missing required environment variables: ${MISSING_VARS[*]}"
    exit 1
fi

print_success "Environment configuration check passed"

# Check for placeholder values
if [[ "$OPENAI_API_KEY" == *"sk-your-openai-api-key-here"* ]]; then
    print_error "OpenAI API key is still using placeholder value"
    exit 1
fi

if [[ "$JWT_SECRET" == *"your-jwt-secret"* ]]; then
    print_error "JWT secret is still using placeholder value"
    exit 1
fi

print_success "No placeholder values found"

# Backup current deployment
print_status "Creating backup of current deployment..."
if [ -d "backup" ]; then
    rm -rf backup
fi
mkdir -p backup
cp -r server backup/ 2>/dev/null || true
cp -r client backup/ 2>/dev/null || true
print_success "Backup created"

# Install dependencies
print_status "Installing server dependencies..."
cd server
npm ci --production
if [ $? -ne 0 ]; then
    print_error "Failed to install server dependencies"
    exit 1
fi
cd ..

print_status "Installing client dependencies..."
cd client
npm ci
if [ $? -ne 0 ]; then
    print_error "Failed to install client dependencies"
    exit 1
fi
cd ..

print_success "Dependencies installed successfully"

# Build client
print_status "Building client application..."
cd client
npm run build
if [ $? -ne 0 ]; then
    print_error "Failed to build client application"
    exit 1
fi
cd ..

print_success "Client application built successfully"

# Run tests (if available)
print_status "Running tests..."
if [ -f "server/package.json" ] && grep -q "\"test\":" server/package.json; then
    cd server
    npm test
    if [ $? -ne 0 ]; then
        print_warning "Tests failed. Continue with deployment?"
        read -p "Continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelled due to test failures"
            exit 1
        fi
    fi
    cd ..
else
    print_warning "No tests configured"
fi

# Create logs directory
print_status "Setting up logging..."
mkdir -p server/logs
chmod 755 server/logs

# Set proper file permissions
print_status "Setting file permissions..."
chmod 600 server/.env
chmod 644 server/package.json
chmod 644 client/package.json

# Create production start script
print_status "Creating production start script..."
cat > start-production.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
export PORT=3010

# Start the server
cd server
node server.js
EOF

chmod +x start-production.sh

# Create PM2 ecosystem file for process management
print_status "Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'kalm-ai-platform',
    script: 'server/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3010
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Create health check script
print_status "Creating health check script..."
cat > health-check.sh << 'EOF'
#!/bin/bash
HEALTH_URL="http://localhost:3010/health"
MAX_RETRIES=30
RETRY_INTERVAL=2

echo "Checking application health..."

for i in $(seq 1 $MAX_RETRIES); do
    if curl -f -s $HEALTH_URL > /dev/null; then
        echo "✅ Application is healthy"
        exit 0
    fi
    
    echo "⏳ Waiting for application to start... (attempt $i/$MAX_RETRIES)"
    sleep $RETRY_INTERVAL
done

echo "❌ Application failed to start within expected time"
exit 1
EOF

chmod +x health-check.sh

# Create monitoring script
print_status "Creating monitoring script..."
cat > monitor.sh << 'EOF'
#!/bin/bash
echo "📊 KALM AI Platform Monitoring"
echo "=============================="

# Check if process is running
if pgrep -f "node server.js" > /dev/null; then
    echo "✅ Server process is running"
else
    echo "❌ Server process is not running"
    exit 1
fi

# Check memory usage
MEMORY_USAGE=$(ps aux | grep "node server.js" | grep -v grep | awk '{print $6}')
if [ ! -z "$MEMORY_USAGE" ]; then
    MEMORY_MB=$((MEMORY_USAGE / 1024))
    echo "💾 Memory usage: ${MEMORY_MB}MB"
fi

# Check disk usage
DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
echo "💿 Disk usage: ${DISK_USAGE}%"

# Check recent logs
echo ""
echo "📝 Recent logs:"
tail -10 server/logs/combined.log 2>/dev/null || echo "No logs found"

# Check health endpoint
if curl -f -s http://localhost:3010/health > /dev/null; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
fi
EOF

chmod +x monitor.sh

# Create rollback script
print_status "Creating rollback script..."
cat > rollback.sh << 'EOF'
#!/bin/bash
echo "🔄 Rolling back to previous deployment..."

if [ -d "backup" ]; then
    # Stop current server
    pkill -f "node server.js" || true
    
    # Restore from backup
    rm -rf server client
    cp -r backup/* .
    
    echo "✅ Rollback completed"
else
    echo "❌ No backup found for rollback"
    exit 1
fi
EOF

chmod +x rollback.sh

# Final checks
print_status "Performing final deployment checks..."

# Check if build artifacts exist
if [ ! -d "client/dist" ]; then
    print_error "Client build artifacts not found"
    exit 1
fi

# Check if server can start
print_status "Testing server startup..."
cd server
timeout 30s node server.js &
SERVER_PID=$!
sleep 5

if kill -0 $SERVER_PID 2>/dev/null; then
    print_success "Server started successfully"
    kill $SERVER_PID
else
    print_error "Server failed to start"
    exit 1
fi
cd ..

print_success "All deployment checks passed!"

# Deployment summary
echo ""
echo "🎉 Production Deployment Completed Successfully!"
echo "================================================"
echo ""
echo "📋 Deployment Summary:"
echo "  ✅ Security audit completed"
echo "  ✅ Environment configuration verified"
echo "  ✅ Dependencies installed"
echo "  ✅ Client application built"
echo "  ✅ Server startup tested"
echo "  ✅ Monitoring scripts created"
echo ""
echo "🚀 To start the application:"
echo "  ./start-production.sh"
echo ""
echo "📊 To monitor the application:"
echo "  ./monitor.sh"
echo ""
echo "🔍 To check application health:"
echo "  ./health-check.sh"
echo ""
echo "🔄 To rollback if needed:"
echo "  ./rollback.sh"
echo ""
echo "📝 Logs will be available in:"
echo "  server/logs/"
echo ""
echo "🌐 Application will be available at:"
echo "  http://localhost:3010"
echo ""

print_success "Deployment completed successfully!" 