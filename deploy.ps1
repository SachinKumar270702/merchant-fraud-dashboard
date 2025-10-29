# Merchant Fraud Dashboard Deployment Script (PowerShell)
# This script builds and deploys the application on Windows

param(
    [switch]$SkipTests,
    [switch]$SkipLint,
    [string]$DeploymentType = "manual"
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

Write-Info "🚀 Starting deployment process..."

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Success "Node.js version check passed: $nodeVersion"
} catch {
    Write-Error "Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Success "npm version: $npmVersion"
} catch {
    Write-Error "npm is not installed. Please install npm and try again."
    exit 1
}

# Install dependencies
Write-Info "Installing dependencies..."
try {
    npm ci
    Write-Success "Dependencies installed successfully"
} catch {
    Write-Error "Failed to install dependencies"
    exit 1
}

# Run linting (unless skipped)
if (-not $SkipLint) {
    Write-Info "Running code linting..."
    try {
        npm run lint
        Write-Success "Linting passed"
    } catch {
        Write-Warning "Linting issues found, but continuing with deployment"
    }
}

# Run tests (unless skipped)
if (-not $SkipTests) {
    Write-Info "Running tests..."
    try {
        npm test
        Write-Success "All tests passed"
    } catch {
        Write-Error "Tests failed. Deployment aborted."
        exit 1
    }
}

# Build the application
Write-Info "Building application for production..."
try {
    npm run build
    Write-Success "Build completed successfully"
} catch {
    Write-Error "Build failed"
    exit 1
}

# Check if build was successful
if (-not (Test-Path "dist")) {
    Write-Error "Build failed - dist directory not found"
    exit 1
}

# Display build information
Write-Info "Build information:"
$distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
$fileCount = (Get-ChildItem -Path "dist" -Recurse -File).Count
Write-Host "  - Build size: $([math]::Round($distSize, 2)) MB"
Write-Host "  - Files created: $fileCount"

if (Test-Path "dist/assets") {
    Write-Host "  - Main assets:"
    Get-ChildItem -Path "dist/assets" | Select-Object -First 5 | ForEach-Object {
        Write-Host "    $($_.Name)"
    }
}

# Test the build locally (optional)
if ($DeploymentType -eq "manual") {
    $testLocal = Read-Host "Do you want to test the build locally? (y/N)"
    if ($testLocal -eq "y" -or $testLocal -eq "Y") {
        Write-Info "Starting local preview server..."
        Write-Info "Open http://localhost:4173 in your browser to test"
        Write-Info "Press Ctrl+C to stop the server and continue with deployment"
        npm run preview
    }
}

# Deployment options
Write-Info "Deployment completed based on type: $DeploymentType"

switch ($DeploymentType.ToLower()) {
    "manual" {
        Write-Success "Build is ready in the 'dist' folder"
        Write-Info "Copy the contents of the 'dist' folder to your web server"
    }
    "netlify" {
        Write-Success "Build is ready for Netlify"
        Write-Info "Go to https://app.netlify.com/drop and drag the 'dist' folder"
    }
    "docker" {
        Write-Info "Docker deployment selected"
        try {
            docker --version | Out-Null
            Write-Info "Building Docker image..."
            docker build -t merchant-fraud-dashboard .
            Write-Success "Docker image built successfully"
            Write-Info "Run with: docker run -p 8080:80 merchant-fraud-dashboard"
        } catch {
            Write-Error "Docker is not installed or not available"
        }
    }
    "github" {
        Write-Info "GitHub Pages deployment selected"
        Write-Info "Make sure you have the GitHub Actions workflow configured"
        Write-Info "Push your changes to trigger automatic deployment"
    }
    default {
        Write-Info "Manual deployment - build ready in 'dist' folder"
    }
}

Write-Success "🎉 Deployment process completed!"
Write-Info "Application features:"
Write-Host "  ✅ Authentication system with RBAC"
Write-Host "  ✅ Role-based access control (Admin, Manager, Analyst, Viewer)"
Write-Host "  ✅ Interactive dashboard with KPIs"
Write-Host "  ✅ Real-time transaction monitoring"
Write-Host "  ✅ Advanced analytics and reporting"
Write-Host "  ✅ Responsive design for all devices"

Write-Info "Demo credentials:"
Write-Host "  Email: merchant@bobssneakers.com"
Write-Host "  Password: password"

Write-Info "For troubleshooting, check:"
Write-Host "  - DEPLOYMENT.md for detailed deployment guides"
Write-Host "  - Browser console for any runtime errors"
Write-Host "  - Network tab for failed API requests"

Write-Success "Happy deploying! 🚀"

# Usage examples:
# .\deploy.ps1                                    # Manual deployment with all checks
# .\deploy.ps1 -SkipTests                        # Skip tests
# .\deploy.ps1 -DeploymentType "docker"          # Build Docker image
# .\deploy.ps1 -SkipTests -SkipLint -DeploymentType "netlify"  # Quick build for Netlify