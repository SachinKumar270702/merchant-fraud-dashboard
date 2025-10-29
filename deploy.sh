#!/bin/bash

# Merchant Fraud Dashboard Deployment Script
# This script builds and deploys the application

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js version check passed: $(node --version)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm ci

# Run linting
print_status "Running code linting..."
if npm run lint; then
    print_success "Linting passed"
else
    print_warning "Linting issues found, but continuing with deployment"
fi

# Run tests
print_status "Running tests..."
if npm test; then
    print_success "All tests passed"
else
    print_error "Tests failed. Deployment aborted."
    exit 1
fi

# Build the application
print_status "Building application for production..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not found"
    exit 1
fi

print_success "Build completed successfully"

# Display build information
print_status "Build information:"
echo "  - Build size: $(du -sh dist | cut -f1)"
echo "  - Files created: $(find dist -type f | wc -l)"
echo "  - Main assets:"
ls -la dist/assets/ | head -10

# Test the build locally (optional)
read -p "Do you want to test the build locally? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting local preview server..."
    print_status "Open http://localhost:4173 in your browser to test"
    print_status "Press Ctrl+C to stop the server and continue with deployment"
    npm run preview
fi

# Deployment options
echo
print_status "Choose deployment option:"
echo "1) Manual deployment (copy dist/ folder)"
echo "2) Deploy to Netlify (drag & drop)"
echo "3) Deploy with Docker"
echo "4) Deploy to GitHub Pages"
echo "5) Skip deployment"

read -p "Enter your choice (1-5): " -n 1 -r
echo

case $REPLY in
    1)
        print_status "Manual deployment selected"
        print_success "Build is ready in the 'dist' folder"
        print_status "Copy the contents of the 'dist' folder to your web server"
        ;;
    2)
        print_status "Netlify deployment selected"
        print_success "Build is ready for Netlify"
        print_status "Go to https://app.netlify.com/drop and drag the 'dist' folder"
        ;;
    3)
        print_status "Docker deployment selected"
        if command -v docker &> /dev/null; then
            print_status "Building Docker image..."
            docker build -t merchant-fraud-dashboard .
            print_success "Docker image built successfully"
            print_status "Run with: docker run -p 8080:80 merchant-fraud-dashboard"
        else
            print_error "Docker is not installed"
        fi
        ;;
    4)
        print_status "GitHub Pages deployment selected"
        print_status "Make sure you have the GitHub Actions workflow configured"
        print_status "Push your changes to trigger automatic deployment"
        ;;
    5)
        print_status "Skipping deployment"
        ;;
    *)
        print_warning "Invalid option selected, skipping deployment"
        ;;
esac

echo
print_success "🎉 Deployment process completed!"
print_status "Application features:"
echo "  ✅ Authentication system with RBAC"
echo "  ✅ Role-based access control (Admin, Manager, Analyst, Viewer)"
echo "  ✅ Interactive dashboard with KPIs"
echo "  ✅ Real-time transaction monitoring"
echo "  ✅ Advanced analytics and reporting"
echo "  ✅ Responsive design for all devices"

print_status "Demo credentials:"
echo "  Email: merchant@bobssneakers.com"
echo "  Password: password"

print_status "For troubleshooting, check:"
echo "  - DEPLOYMENT.md for detailed deployment guides"
echo "  - Browser console for any runtime errors"
echo "  - Network tab for failed API requests"

echo
print_success "Happy deploying! 🚀"