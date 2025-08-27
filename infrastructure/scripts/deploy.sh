#!/bin/bash

# Copyright (c) 2025 Eventful India Marketing Services, India
# All rights reserved.
# 
# Service: taxonomy
# Port: 3201
# Multi-Cloud Deployment Script
# Template: Eventzr Code Repository Template v1.0

set -euo pipefail

# Configuration
SERVICE_NAME="taxonomy"
SERVICE_PORT="3201"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
Taxonomy Service Deployment Script

Usage: $0 [OPTIONS] <environment> [cloud-provider]

Arguments:
  environment     Target environment (dev|staging|production)
  cloud-provider  Cloud provider (aws|gcp|azure|all) [default: aws]

Options:
  -h, --help      Show this help message
  -v, --validate  Validate infrastructure without deploying
  -d, --destroy   Destroy infrastructure (use with caution)
  -b, --build     Build application before deployment
  -t, --test      Run tests after deployment
  --skip-build    Skip application build
  --skip-tests    Skip deployment tests
  --auto-approve  Auto-approve Terraform changes

Examples:
  $0 dev aws                    # Deploy to dev environment on AWS
  $0 production all --test      # Deploy to production on all clouds with tests
  $0 staging gcp --validate     # Validate staging infrastructure on GCP
  $0 dev aws --destroy          # Destroy dev environment on AWS

EOF
}

# Parse command line arguments
VALIDATE_ONLY=false
DESTROY=false
BUILD_APP=true
RUN_TESTS=false
SKIP_TESTS=false
AUTO_APPROVE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--validate)
            VALIDATE_ONLY=true
            shift
            ;;
        -d|--destroy)
            DESTROY=true
            shift
            ;;
        -b|--build)
            BUILD_APP=true
            shift
            ;;
        -t|--test)
            RUN_TESTS=true
            shift
            ;;
        --skip-build)
            BUILD_APP=false
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --auto-approve)
            AUTO_APPROVE=true
            shift
            ;;
        -*)
            log_error "Unknown option $1"
            show_help
            exit 1
            ;;
        *)
            break
            ;;
    esac
done

# Validate required arguments
if [[ $# -lt 1 ]]; then
    log_error "Environment argument is required"
    show_help
    exit 1
fi

ENVIRONMENT=$1
CLOUD_PROVIDER=${2:-aws}

# Validate environment
case $ENVIRONMENT in
    dev|staging|production)
        ;;
    *)
        log_error "Invalid environment: $ENVIRONMENT. Must be dev, staging, or production."
        exit 1
        ;;
esac

# Validate cloud provider
case $CLOUD_PROVIDER in
    aws|gcp|azure|all)
        ;;
    *)
        log_error "Invalid cloud provider: $CLOUD_PROVIDER. Must be aws, gcp, azure, or all."
        exit 1
        ;;
esac

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."

    # Check required tools
    local required_tools=("terraform" "docker" "node" "npm")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "Required tool '$tool' is not installed"
            exit 1
        fi
    done

    # Check Node.js version
    local node_version=$(node --version | cut -d'v' -f2)
    local required_version="20.0.0"
    if ! printf '%s\n%s\n' "$required_version" "$node_version" | sort -V -C; then
        log_error "Node.js version $node_version is not supported. Required: $required_version+"
        exit 1
    fi

    # Check Terraform version
    local terraform_version=$(terraform version -json | jq -r '.terraform_version')
    local required_tf_version="1.5.0"
    if ! printf '%s\n%s\n' "$required_tf_version" "$terraform_version" | sort -V -C; then
        log_error "Terraform version $terraform_version is not supported. Required: $required_tf_version+"
        exit 1
    fi

    log_success "Pre-deployment checks passed"
}

# Build application
build_application() {
    if [[ "$BUILD_APP" == "true" ]]; then
        log_info "Building taxonomy service..."
        
        cd "$ROOT_DIR/backend"
        
        # Install dependencies
        log_info "Installing dependencies..."
        npm ci --only=production=false
        
        # Generate Prisma client
        log_info "Generating Prisma client..."
        npm run prisma:generate
        
        # Run tests
        if [[ "$SKIP_TESTS" == "false" ]]; then
            log_info "Running tests..."
            npm run test
            npm run test:e2e
        fi
        
        # Build application
        log_info "Building application..."
        npm run build
        
        # Package for Lambda
        log_info "Packaging for Lambda..."
        npm run lambda:build
        
        # Build Docker image
        log_info "Building Docker image..."
        docker build -t "eventzr/taxonomy:$ENVIRONMENT" .
        
        log_success "Application build completed"
    else
        log_info "Skipping application build"
    fi
}

# Deploy to cloud provider
deploy_to_cloud() {
    local cloud=$1
    local tf_dir="$ROOT_DIR/infrastructure/terraform/$cloud"
    
    if [[ ! -d "$tf_dir" ]]; then
        log_error "Terraform configuration not found for $cloud: $tf_dir"
        return 1
    fi
    
    log_info "Deploying to $cloud ($ENVIRONMENT)..."
    
    cd "$tf_dir"
    
    # Initialize Terraform
    log_info "Initializing Terraform..."
    terraform init
    
    # Select workspace
    log_info "Selecting workspace: $ENVIRONMENT"
    terraform workspace select "$ENVIRONMENT" 2>/dev/null || terraform workspace new "$ENVIRONMENT"
    
    if [[ "$DESTROY" == "true" ]]; then
        # Destroy infrastructure
        log_warn "DESTROYING infrastructure for $ENVIRONMENT on $cloud"
        if [[ "$AUTO_APPROVE" == "true" ]]; then
            terraform destroy -auto-approve -var="environment=$ENVIRONMENT"
        else
            terraform destroy -var="environment=$ENVIRONMENT"
        fi
        log_success "Infrastructure destroyed on $cloud"
    else
        # Plan deployment
        log_info "Planning deployment..."
        terraform plan -var="environment=$ENVIRONMENT" -out="$ENVIRONMENT.tfplan"
        
        if [[ "$VALIDATE_ONLY" == "true" ]]; then
            log_success "Infrastructure validation completed for $cloud"
            return 0
        fi
        
        # Apply deployment
        log_info "Applying deployment..."
        if [[ "$AUTO_APPROVE" == "true" ]]; then
            terraform apply -auto-approve "$ENVIRONMENT.tfplan"
        else
            terraform apply "$ENVIRONMENT.tfplan"
        fi
        
        # Get outputs
        local outputs=$(terraform output -json)
        echo "$outputs" > "$ROOT_DIR/infrastructure/outputs/$cloud-$ENVIRONMENT.json"
        
        log_success "Infrastructure deployed to $cloud"
    fi
}

# Post-deployment tests
run_deployment_tests() {
    if [[ "$RUN_TESTS" == "true" && "$DESTROY" == "false" && "$VALIDATE_ONLY" == "false" ]]; then
        log_info "Running deployment tests..."
        
        # Health check
        local health_url="https://api${ENVIRONMENT:+.${ENVIRONMENT}}.eventzr.com/v1/taxonomy/health"
        log_info "Health check: $health_url"
        
        local retries=0
        local max_retries=30
        while [[ $retries -lt $max_retries ]]; do
            if curl -f -s "$health_url" > /dev/null; then
                log_success "Health check passed"
                break
            fi
            
            retries=$((retries + 1))
            log_info "Health check failed, retrying ($retries/$max_retries)..."
            sleep 10
        done
        
        if [[ $retries -eq $max_retries ]]; then
            log_error "Health check failed after $max_retries attempts"
            return 1
        fi
        
        # Run integration tests
        cd "$ROOT_DIR/backend"
        log_info "Running integration tests against deployed service..."
        npm run test:deployed -- --env="$ENVIRONMENT"
        
        log_success "Deployment tests completed"
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    find "$ROOT_DIR/infrastructure/terraform" -name "*.tfplan" -delete
    log_success "Cleanup completed"
}

# Main execution
main() {
    log_info "Starting deployment of $SERVICE_NAME service"
    log_info "Environment: $ENVIRONMENT"
    log_info "Cloud Provider: $CLOUD_PROVIDER"
    
    # Create outputs directory
    mkdir -p "$ROOT_DIR/infrastructure/outputs"
    
    # Trap cleanup on exit
    trap cleanup EXIT
    
    # Run pre-deployment checks
    pre_deployment_checks
    
    # Build application
    build_application
    
    # Deploy to cloud providers
    if [[ "$CLOUD_PROVIDER" == "all" ]]; then
        for cloud in aws gcp azure; do
            deploy_to_cloud "$cloud" || {
                log_error "Failed to deploy to $cloud"
                exit 1
            }
        done
    else
        deploy_to_cloud "$CLOUD_PROVIDER" || {
            log_error "Failed to deploy to $CLOUD_PROVIDER"
            exit 1
        }
    fi
    
    # Run post-deployment tests
    run_deployment_tests
    
    if [[ "$DESTROY" == "true" ]]; then
        log_success "Taxonomy service infrastructure destroyed successfully"
    else
        log_success "Taxonomy service deployed successfully!"
        log_info "Service URL: https://api${ENVIRONMENT:+.${ENVIRONMENT}}.eventzr.com/v1/taxonomy"
        log_info "Health Check: https://api${ENVIRONMENT:+.${ENVIRONMENT}}.eventzr.com/v1/taxonomy/health"
        if [[ "$ENVIRONMENT" != "production" ]]; then
            log_info "Documentation: https://api${ENVIRONMENT:+.${ENVIRONMENT}}.eventzr.com/v1/taxonomy/docs"
        fi
    fi
}

# Run main function
main "$@"


