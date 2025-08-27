# Copyright (c) 2025 Eventful India Marketing Services, India
# All rights reserved.
# 
# Service: taxonomy
# Port: 3201
# Terraform Outputs
# Template: Eventzr Code Repository Template v1.0

# Lambda Function
output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.taxonomy.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.taxonomy.arn
}

output "lambda_function_version" {
  description = "Version of the Lambda function"
  value       = aws_lambda_function.taxonomy.version
}

output "lambda_alias_arn" {
  description = "ARN of the Lambda alias"
  value       = aws_lambda_alias.taxonomy_live.arn
}

# Database
output "database_cluster_endpoint" {
  description = "RDS cluster endpoint"
  value       = aws_rds_cluster.taxonomy.endpoint
  sensitive   = true
}

output "database_cluster_reader_endpoint" {
  description = "RDS cluster reader endpoint"
  value       = aws_rds_cluster.taxonomy.reader_endpoint
  sensitive   = true
}

output "database_port" {
  description = "RDS cluster port"
  value       = aws_rds_cluster.taxonomy.port
}

output "database_name" {
  description = "Database name"
  value       = aws_rds_cluster.taxonomy.database_name
}

output "db_proxy_endpoint" {
  description = "Database proxy endpoint"
  value       = aws_db_proxy.taxonomy.endpoint
  sensitive   = true
}

# Cache
output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_replication_group.taxonomy.primary_endpoint_address
  sensitive   = true
}

output "redis_port" {
  description = "ElastiCache Redis port"
  value       = aws_elasticache_replication_group.taxonomy.port
}

# Security
output "kms_key_id" {
  description = "KMS key ID"
  value       = aws_kms_key.taxonomy_key.key_id
}

output "kms_key_arn" {
  description = "KMS key ARN"
  value       = aws_kms_key.taxonomy_key.arn
}

# Secrets
output "db_credentials_secret_arn" {
  description = "Database credentials secret ARN"
  value       = aws_secretsmanager_secret.db_credentials.arn
  sensitive   = true
}

output "redis_credentials_secret_arn" {
  description = "Redis credentials secret ARN"
  value       = aws_secretsmanager_secret.redis_credentials.arn
  sensitive   = true
}

output "jwt_secret_arn" {
  description = "JWT secret ARN"
  value       = aws_secretsmanager_secret.jwt_secret.arn
  sensitive   = true
}

# API Gateway
output "api_gateway_id" {
  description = "API Gateway ID"
  value       = data.aws_api_gateway_rest_api.main.id
}

output "api_gateway_execution_arn" {
  description = "API Gateway execution ARN"
  value       = data.aws_api_gateway_rest_api.main.execution_arn
}

# Monitoring
output "cloudwatch_log_group_name" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.lambda_logs.name
}

output "sns_topic_arn" {
  description = "SNS topic ARN for alerts"
  value       = aws_sns_topic.taxonomy_alerts.arn
}

# Service URLs
output "service_url" {
  description = "Service public URL"
  value       = "https://${var.api_gateway_domain}/v1/taxonomy"
}

output "health_check_url" {
  description = "Health check URL"
  value       = "https://${var.api_gateway_domain}/v1/taxonomy/health"
}

output "swagger_url" {
  description = "Swagger documentation URL"
  value       = var.environment != "production" ? "https://${var.api_gateway_domain}/v1/taxonomy/docs" : null
}

# Configuration for downstream services
output "service_config" {
  description = "Service configuration for other services"
  value = {
    name                = "taxonomy"
    port                = "3201"
    url                 = "https://${var.api_gateway_domain}/v1/taxonomy"
    health_check_path   = "/health"
    lambda_function_arn = aws_lambda_function.taxonomy.arn
    environment         = var.environment
  }
}

# Infrastructure summary
output "infrastructure_summary" {
  description = "Summary of deployed infrastructure"
  value = {
    lambda = {
      function_name = aws_lambda_function.taxonomy.function_name
      runtime       = aws_lambda_function.taxonomy.runtime
      memory_size   = aws_lambda_function.taxonomy.memory_size
      timeout       = aws_lambda_function.taxonomy.timeout
    }
    database = {
      cluster_identifier = aws_rds_cluster.taxonomy.cluster_identifier
      engine            = aws_rds_cluster.taxonomy.engine
      engine_version    = aws_rds_cluster.taxonomy.engine_version
      instance_count    = length(aws_rds_cluster_instance.taxonomy)
    }
    cache = {
      replication_group_id = aws_elasticache_replication_group.taxonomy.replication_group_id
      node_type           = aws_elasticache_replication_group.taxonomy.node_type
      num_cache_clusters  = aws_elasticache_replication_group.taxonomy.num_cache_clusters
    }
    monitoring = {
      dashboard_url = "https://console.aws.amazon.com/cloudwatch/home?region=${data.aws_region.current.name}#dashboards:name=Eventzr-${title(var.environment)}-Taxonomy"
      log_group     = aws_cloudwatch_log_group.lambda_logs.name
    }
  }
}



