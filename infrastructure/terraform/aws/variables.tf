# Copyright (c) 2025 Eventful India Marketing Services, India
# All rights reserved.
# 
# Service: taxonomy
# Port: 3201
# Terraform Variables
# Template: Eventzr Code Repository Template v1.0

# Environment configuration
variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

# Lambda configuration
variable "lambda_zip_path" {
  description = "Path to the Lambda deployment package"
  type        = string
  default     = "../../../backend/dist/taxonomy-lambda.zip"
}

# API Gateway configuration
variable "api_gateway_domain" {
  description = "API Gateway domain name"
  type        = string
  default     = "api.eventzr.com"
}

# Monitoring configuration
variable "alert_email_addresses" {
  description = "List of email addresses for alerts"
  type        = list(string)
  default     = ["platform-team@eventzr.com"]
}

variable "slack_webhook_url" {
  description = "Slack webhook URL for alerts"
  type        = string
  default     = ""
  sensitive   = true
}

# Security configuration
variable "admin_ip_whitelist" {
  description = "List of IP addresses allowed for admin operations"
  type        = list(string)
  default     = ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"]
}

# External API keys (encrypted)
variable "openai_api_key" {
  description = "OpenAI API key for AI functionality"
  type        = string
  default     = ""
  sensitive   = true
}

variable "external_api_keys" {
  description = "External API keys as JSON string"
  type        = string
  default     = "{}"
  sensitive   = true
}

# Feature flags
variable "enable_deletion_protection" {
  description = "Enable deletion protection for production resources"
  type        = bool
  default     = true
}

variable "enable_multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = true
}

variable "enable_enhanced_monitoring" {
  description = "Enable enhanced monitoring"
  type        = bool
  default     = true
}

# Backup configuration
variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
}

# Scaling configuration
variable "auto_scaling_enabled" {
  description = "Enable auto-scaling"
  type        = bool
  default     = true
}

# Network configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC (if creating new VPC)"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# Cost optimization
variable "enable_cost_optimization" {
  description = "Enable cost optimization features"
  type        = bool
  default     = true
}

variable "reserved_concurrency" {
  description = "Reserved concurrency for Lambda function"
  type        = number
  default     = null
}



