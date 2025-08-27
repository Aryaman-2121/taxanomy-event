# Copyright (c) 2025 Eventful India Marketing Services, India
# All rights reserved.
# 
# Service: taxonomy
# Port: 3201
# Security Configuration (KMS, Secrets, IAM)
# Template: Eventzr Code Repository Template v1.0

# KMS key for taxonomy service encryption
resource "aws_kms_key" "taxonomy_key" {
  description              = "KMS key for taxonomy service encryption"
  key_usage               = "ENCRYPT_DECRYPT"
  customer_master_key_spec = "SYMMETRIC_DEFAULT"
  deletion_window_in_days  = var.environment == "production" ? 30 : 7
  
  # Key policy
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "EnableIAMUserPermissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "AllowTaxonomyServiceAccess"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_role.lambda_execution_role.arn
        }
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey",
          "kms:Encrypt",
          "kms:GenerateDataKey",
          "kms:ReEncrypt*"
        ]
        Resource = "*"
      },
      {
        Sid    = "AllowCloudWatchLogsAccess"
        Effect = "Allow"
        Principal = {
          Service = "logs.${data.aws_region.current.name}.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = "*"
        Condition = {
          ArnEquals = {
            "kms:EncryptionContext:aws:logs:arn" = [
              "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/eventzr-${var.environment}-taxonomy",
              "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/elasticache/eventzr-${var.environment}-taxonomy",
              "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/apigateway/eventzr-${var.environment}-taxonomy"
            ]
          }
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "eventzr-${var.environment}-taxonomy-key"
  })
}

# KMS key alias
resource "aws_kms_alias" "taxonomy_key" {
  name          = "alias/eventzr-${var.environment}-taxonomy"
  target_key_id = aws_kms_key.taxonomy_key.key_id
}

# JWT Secret
resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "eventzr/${var.environment}/taxonomy/jwt-secret"
  description             = "JWT secret for taxonomy service"
  kms_key_id              = aws_kms_key.taxonomy_key.arn
  recovery_window_in_days = var.environment == "production" ? 30 : 0

  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_password.jwt_secret.result
}

# API Keys for external integrations
resource "aws_secretsmanager_secret" "api_keys" {
  name                    = "eventzr/${var.environment}/taxonomy/api-keys"
  description             = "API keys for taxonomy service external integrations"
  kms_key_id              = aws_kms_key.taxonomy_key.arn
  recovery_window_in_days = var.environment == "production" ? 30 : 0

  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "api_keys" {
  secret_id = aws_secretsmanager_secret.api_keys.id
  secret_string = jsonencode({
    openai_api_key = var.openai_api_key
    external_api_keys = var.external_api_keys
  })
}

# IAM role for secret access
resource "aws_iam_role" "secrets_access" {
  name = "eventzr-${var.environment}-taxonomy-secrets-access"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_role.lambda_execution_role.arn
        }
      }
    ]
  })

  tags = local.common_tags
}

# Security Groups (referenced from shared infrastructure)
data "aws_security_group" "lambda_sg" {
  name = "eventzr-${var.environment}-lambda-sg"
}

data "aws_security_group" "rds_sg" {
  name = "eventzr-${var.environment}-rds-sg"
}

data "aws_security_group" "elasticache_sg" {
  name = "eventzr-${var.environment}-elasticache-sg"
}

# WAF Web ACL for API protection
resource "aws_wafv2_web_acl" "taxonomy_api" {
  name  = "eventzr-${var.environment}-taxonomy-api-acl"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  # Rate limiting rule (600 rpm from registry)
  rule {
    name     = "TaxonomyRateLimitRule"
    priority = 1

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 600  # Registry requirement
        aggregate_key_type = "IP"

        scope_down_statement {
          byte_match_statement {
            search_string = "/v1/taxonomy"
            field_to_match {
              uri_path {}
            }
            text_transformation {
              priority = 0
              type     = "LOWERCASE"
            }
            positional_constraint = "STARTS_WITH"
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "TaxonomyRateLimitRule"
      sampled_requests_enabled   = true
    }
  }

  # SQL injection protection
  rule {
    name     = "SQLInjectionRule"
    priority = 2

    action {
      block {}
    }

    statement {
      sqli_match_statement {
        field_to_match {
          body {}
        }
        text_transformation {
          priority = 1
          type     = "URL_DECODE"
        }
        text_transformation {
          priority = 2
          type     = "HTML_ENTITY_DECODE"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "SQLInjectionRule"
      sampled_requests_enabled   = true
    }
  }

  # XSS protection
  rule {
    name     = "XSSRule"
    priority = 3

    action {
      block {}
    }

    statement {
      xss_match_statement {
        field_to_match {
          body {}
        }
        text_transformation {
          priority = 1
          type     = "URL_DECODE"
        }
        text_transformation {
          priority = 2
          type     = "HTML_ENTITY_DECODE"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "XSSRule"
      sampled_requests_enabled   = true
    }
  }

  # IP whitelist for admin operations
  rule {
    name     = "AdminIPWhitelistRule"
    priority = 4

    action {
      allow {}
    }

    statement {
      and_statement {
        statement {
          byte_match_statement {
            search_string = "/v1/taxonomy/admin"
            field_to_match {
              uri_path {}
            }
            text_transformation {
              priority = 0
              type     = "LOWERCASE"
            }
            positional_constraint = "STARTS_WITH"
          }
        }
        statement {
          ip_set_reference_statement {
            arn = aws_wafv2_ip_set.admin_ips.arn
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AdminIPWhitelistRule"
      sampled_requests_enabled   = true
    }
  }

  tags = local.common_tags

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "TaxonomyWebACL"
    sampled_requests_enabled   = true
  }
}

# IP set for admin operations
resource "aws_wafv2_ip_set" "admin_ips" {
  name               = "eventzr-${var.environment}-taxonomy-admin-ips"
  scope              = "REGIONAL"
  ip_address_version = "IPV4"

  addresses = var.admin_ip_whitelist

  tags = local.common_tags
}

# Associate WAF with API Gateway
resource "aws_wafv2_web_acl_association" "api_gateway" {
  resource_arn = "arn:aws:apigateway:${data.aws_region.current.name}::/restapis/${data.aws_api_gateway_rest_api.main.id}/stages/${var.environment}"
  web_acl_arn  = aws_wafv2_web_acl.taxonomy_api.arn
}

# PART B: MONITORING, CI/CD, AND MULTI-CLOUD

