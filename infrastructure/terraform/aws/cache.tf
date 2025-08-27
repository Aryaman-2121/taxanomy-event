# Copyright (c) 2025 Eventful India Marketing Services, India
# All rights reserved.
# 
# Service: taxonomy
# Port: 3201
# ElastiCache Redis Configuration
# Template: Eventzr Code Repository Template v1.0

# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "taxonomy" {
  name       = "eventzr-${var.environment}-taxonomy-cache-subnet-group"
  subnet_ids = data.aws_subnets.private.ids

  tags = merge(local.common_tags, {
    Name = "eventzr-${var.environment}-taxonomy-cache-subnet-group"
  })
}

# ElastiCache Parameter Group
resource "aws_elasticache_parameter_group" "taxonomy" {
  family = "redis7.x"
  name   = "eventzr-${var.environment}-taxonomy-redis-params"

  # Optimize for taxonomy workloads
  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  parameter {
    name  = "timeout"
    value = "300"  # 5 minutes
  }

  parameter {
    name  = "tcp-keepalive"
    value = "60"
  }

  # Enable persistence in production
  parameter {
    name  = "save"
    value = var.environment == "production" ? "900 1 300 10 60 10000" : ""
  }

  tags = local.common_tags
}

# ElastiCache Replication Group (Redis Cluster)
resource "aws_elasticache_replication_group" "taxonomy" {
  replication_group_id         = "eventzr-${var.environment}-taxonomy-redis"
  description                  = "Redis cluster for taxonomy service caching"
  
  # Node configuration
  node_type                   = local.current_config.cache_node_type
  port                        = 6379
  parameter_group_name        = aws_elasticache_parameter_group.taxonomy.name
  
  # Cluster configuration
  num_cache_clusters          = var.environment == "production" ? 3 : 1
  automatic_failover_enabled  = var.environment == "production" ? true : false
  multi_az_enabled           = var.environment == "production" ? true : false
  
  # Network configuration
  subnet_group_name          = aws_elasticache_subnet_group.taxonomy.name
  security_group_ids         = [data.aws_security_group.elasticache.id]
  
  # Engine configuration
  engine_version             = "7.0"
  
  # Backup configuration
  snapshot_retention_limit   = var.environment == "production" ? 7 : 1
  snapshot_window           = "03:00-05:00"
  maintenance_window        = "sun:05:00-sun:07:00"
  
  # Security
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                = random_password.redis_auth_token.result
  kms_key_id                = aws_kms_key.taxonomy_key.arn
  
  # Logging
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.elasticache_logs.name
    destination_type = "cloudwatch-logs"
    log_format      = "json"
    log_type        = "slow-log"
  }

  # Final snapshot
  final_snapshot_identifier = var.environment == "production" ? "eventzr-${var.environment}-taxonomy-redis-final-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  tags = merge(local.common_tags, {
    Name = "eventzr-${var.environment}-taxonomy-redis"
  })

  lifecycle {
    ignore_changes = [auth_token]
  }
}

# Generate auth token for Redis
resource "random_password" "redis_auth_token" {
  length  = 64
  special = true
}

# Store Redis auth token in Secrets Manager
resource "aws_secretsmanager_secret" "redis_credentials" {
  name                    = "eventzr/${var.environment}/taxonomy/redis-credentials"
  description             = "Redis credentials for taxonomy service"
  kms_key_id              = aws_kms_key.taxonomy_key.arn
  recovery_window_in_days = var.environment == "production" ? 30 : 0

  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "redis_credentials" {
  secret_id = aws_secretsmanager_secret.redis_credentials.id
  secret_string = jsonencode({
    auth_token = random_password.redis_auth_token.result
    host       = aws_elasticache_replication_group.taxonomy.primary_endpoint_address
    port       = aws_elasticache_replication_group.taxonomy.port
  })
}

# CloudWatch Log Group for Redis logs
resource "aws_cloudwatch_log_group" "elasticache_logs" {
  name              = "/aws/elasticache/eventzr-${var.environment}-taxonomy"
  retention_in_days = local.current_config.log_retention
  kms_key_id        = aws_kms_key.taxonomy_key.arn

  tags = local.common_tags
}

# ElastiCache notifications
resource "aws_sns_topic" "elasticache_notifications" {
  name         = "eventzr-${var.environment}-taxonomy-cache-notifications"
  display_name = "Taxonomy ElastiCache Notifications"
  kms_master_key_id = aws_kms_key.taxonomy_key.arn

  tags = local.common_tags
}

resource "aws_elasticache_notification_topic" "taxonomy" {
  topic_arn    = aws_sns_topic.elasticache_notifications.arn
  cluster_id   = aws_elasticache_replication_group.taxonomy.replication_group_id
}

# CloudWatch alarms for cache monitoring
resource "aws_cloudwatch_metric_alarm" "cache_cpu_high" {
  alarm_name          = "eventzr-${var.environment}-taxonomy-cache-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = "120"
  statistic           = "Average"
  threshold           = "75"
  alarm_description   = "This metric monitors taxonomy cache CPU utilization"
  alarm_actions       = [aws_sns_topic.elasticache_notifications.arn]

  dimensions = {
    CacheClusterId = aws_elasticache_replication_group.taxonomy.replication_group_id
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "cache_memory_high" {
  alarm_name          = "eventzr-${var.environment}-taxonomy-cache-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseMemoryUsagePercentage"
  namespace           = "AWS/ElastiCache"
  period              = "120"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors taxonomy cache memory usage"
  alarm_actions       = [aws_sns_topic.elasticache_notifications.arn]

  dimensions = {
    CacheClusterId = aws_elasticache_replication_group.taxonomy.replication_group_id
  }

  tags = local.common_tags
}

