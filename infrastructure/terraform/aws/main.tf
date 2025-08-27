# Copyright (c) 2025 Eventful India Marketing Services, India
# All rights reserved.
# 
# Service: taxonomy
# Port: 3201
# AWS Infrastructure - Production Ready
# Template: Eventzr Code Repository Template v1.0

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }

  backend "s3" {
    bucket         = "eventzr-terraform-state"
    key            = "services/taxonomy/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

# Configure AWS Provider
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "eventzr"
      Service     = "taxonomy"
      Port        = "3201"
      Environment = var.environment
      ManagedBy   = "terraform"
      Owner       = "platform-team"
      CostCenter  = "engineering"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
data "aws_availability_zones" "available" {
  state = "available"
}

# Local values
locals {
  service_name = "taxonomy"
  service_port = "3201"
  
  # Environment-specific configuration
  config = {
    dev = {
      lambda_memory    = 512
      lambda_timeout   = 30
      min_capacity     = 1
      max_capacity     = 5
      db_instance_class = "db.serverless"
      cache_node_type  = "cache.t3.micro"
      log_retention    = 7
    }
    staging = {
      lambda_memory    = 1024
      lambda_timeout   = 60
      min_capacity     = 2
      max_capacity     = 10
      db_instance_class = "db.serverless"
      cache_node_type  = "cache.t3.small"
      log_retention    = 30
    }
    production = {
      lambda_memory    = 3008
      lambda_timeout   = 60
      min_capacity     = 3
      max_capacity     = 50
      db_instance_class = "db.serverless"
      cache_node_type  = "cache.r6g.large"
      log_retention    = 90
    }
  }

  current_config = local.config[var.environment]

  common_tags = {
    Service     = local.service_name
    Port        = local.service_port
    Environment = var.environment
    Terraform   = "true"
  }
}

# VPC Configuration (shared across services)
data "aws_vpc" "main" {
  filter {
    name   = "tag:Name"
    values = ["eventzr-${var.environment}-vpc"]
  }
}

data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }

  filter {
    name   = "tag:Type"
    values = ["Private"]
  }
}

data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }

  filter {
    name   = "tag:Type"
    values = ["Public"]
  }
}

data "aws_security_group" "lambda" {
  name = "eventzr-${var.environment}-lambda-sg"
}

data "aws_security_group" "rds" {
  name = "eventzr-${var.environment}-rds-sg"
}

data "aws_security_group" "elasticache" {
  name = "eventzr-${var.environment}-elasticache-sg"
}


