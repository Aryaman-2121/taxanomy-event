# Copyright (c) 2025 Eventful India Marketing Services, India
# All rights reserved.
# 
# Service: taxonomy
# Port: 3201
# CloudWatch Monitoring & Alerting
# Template: Eventzr Code Repository Template v1.0

# SNS topic for alerts
resource "aws_sns_topic" "taxonomy_alerts" {
  name              = "eventzr-${var.environment}-taxonomy-alerts"
  display_name      = "Taxonomy Service Alerts"
  kms_master_key_id = aws_kms_key.taxonomy_key.arn

  tags = local.common_tags
}

# SNS topic subscription for email alerts
resource "aws_sns_topic_subscription" "email_alerts" {
  count     = length(var.alert_email_addresses)
  topic_arn = aws_sns_topic.taxonomy_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email_addresses[count.index]
}

# SNS topic subscription for Slack webhook
resource "aws_sns_topic_subscription" "slack_alerts" {
  count     = var.slack_webhook_url != "" ? 1 : 0
  topic_arn = aws_sns_topic.taxonomy_alerts.arn
  protocol  = "https"
  endpoint  = var.slack_webhook_url
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "taxonomy" {
  dashboard_name = "Eventzr-${title(var.environment)}-Taxonomy"

  dashboard_body = jsonencode({
    widgets = [
      # Lambda Performance Metrics
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", aws_lambda_function.taxonomy.function_name],
            [".", "Errors", ".", "."],
            [".", "Invocations", ".", "."],
            [".", "Throttles", ".", "."],
            [".", "ConcurrentExecutions", ".", "."]
          ]
          period = 300
          stat   = "Average"
          region = data.aws_region.current.name
          title  = "Lambda Performance Metrics"
          view   = "timeSeries"
          yAxis = {
            left = {
              min = 0
            }
          }
        }
      },

      # Database Performance
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBClusterIdentifier", aws_rds_cluster.taxonomy.cluster_identifier],
            [".", "DatabaseConnections", ".", "."],
            [".", "ReadLatency", ".", "."],
            [".", "WriteLatency", ".", "."],
            [".", "ReadIOPS", ".", "."],
            [".", "WriteIOPS", ".", "."]
          ]
          period = 300
          stat   = "Average"
          region = data.aws_region.current.name
          title  = "Database Performance"
          view   = "timeSeries"
        }
      },

      # Cache Performance
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ElastiCache", "CPUUtilization", "CacheClusterId", aws_elasticache_replication_group.taxonomy.replication_group_id],
            [".", "DatabaseMemoryUsagePercentage", ".", "."],
            [".", "CacheHitRate", ".", "."],
            [".", "CacheMissRate", ".", "."],
            [".", "NetworkBytesIn", ".", "."],
            [".", "NetworkBytesOut", ".", "."]
          ]
          period = 300
          stat   = "Average"
          region = data.aws_region.current.name
          title  = "Cache Performance"
          view   = "timeSeries"
        }
      },

      # API Gateway Metrics
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ApiGateway", "Count", "ApiName", "eventzr-${var.environment}-api-gateway", "Resource", "taxonomy"],
            [".", "Latency", ".", ".", ".", "."],
            [".", "4XXError", ".", ".", ".", "."],
            [".", "5XXError", ".", ".", ".", "."]
          ]
          period = 300
          stat   = "Sum"
          region = data.aws_region.current.name
          title  = "API Gateway Metrics"
          view   = "timeSeries"
        }
      },

      # Business Metrics
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 24
        height = 6

        properties = {
          metrics = [
            ["EventZr/Taxonomy", "TaxonomiesCreated", "Service", "taxonomy", "Environment", var.environment],
            [".", "CategoriesCreated", ".", ".", ".", "."],
            [".", "ClassificationsCreated", ".", ".", ".", "."],
            [".", "AIClassifications", ".", ".", ".", "."],
            [".", "CacheHitRatio", ".", ".", ".", "."]
          ]
          period = 300
          stat   = "Sum"
          region = data.aws_region.current.name
          title  = "Business Metrics"
          view   = "timeSeries"
        }
      }
    ]
  })
}

# Lambda Error Rate Alarm
resource "aws_cloudwatch_metric_alarm" "lambda_error_rate" {
  alarm_name          = "eventzr-${var.environment}-taxonomy-lambda-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "Lambda function error rate is too high"
  alarm_actions       = [aws_sns_topic.taxonomy_alerts.arn]
  ok_actions          = [aws_sns_topic.taxonomy_alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.taxonomy.function_name
  }

  tags = local.common_tags
}

# Lambda Duration Alarm (Registry SLO: P95 < 400ms read, 700ms write)
resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  alarm_name          = "eventzr-${var.environment}-taxonomy-lambda-duration"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "3"
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Average"
  threshold           = var.environment == "production" ? "5000" : "10000"  # Allow more time for cold starts
  alarm_description   = "Lambda function duration is too high"
  alarm_actions       = [aws_sns_topic.taxonomy_alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.taxonomy.function_name
  }

  tags = local.common_tags
}

# Lambda Throttle Alarm
resource "aws_cloudwatch_metric_alarm" "lambda_throttles" {
  alarm_name          = "eventzr-${var.environment}-taxonomy-lambda-throttles"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "Throttles"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "Lambda function is being throttled"
  alarm_actions       = [aws_sns_topic.taxonomy_alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.taxonomy.function_name
  }

  tags = local.common_tags
}

# Database CPU Alarm
resource "aws_cloudwatch_metric_alarm" "db_cpu" {
  alarm_name          = "eventzr-${var.environment}-taxonomy-db-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "3"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "75"
  alarm_description   = "Database CPU utilization is too high"
  alarm_actions       = [aws_sns_topic.taxonomy_alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    DBClusterIdentifier = aws_rds_cluster.taxonomy.cluster_identifier
  }

  tags = local.common_tags
}

# Database Connection Alarm
resource "aws_cloudwatch_metric_alarm" "db_connections" {
  alarm_name          = "eventzr-${var.environment}-taxonomy-db-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = var.environment == "production" ? "100" : "50"
  alarm_description   = "Database connection count is too high"
  alarm_actions       = [aws_sns_topic.taxonomy_alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    DBClusterIdentifier = aws_rds_cluster.taxonomy.cluster_identifier
  }

  tags = local.common_tags
}

# API Gateway 4XX Error Alarm
resource "aws_cloudwatch_metric_alarm" "api_4xx_errors" {
  alarm_name          = "eventzr-${var.environment}-taxonomy-api-4xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "3"
  metric_name         = "4XXError"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = "20"
  alarm_description   = "High rate of 4XX errors from API Gateway"
  alarm_actions       = [aws_sns_topic.taxonomy_alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiName  = "eventzr-${var.environment}-api-gateway"
    Resource = "taxonomy"
  }

  tags = local.common_tags
}

# API Gateway 5XX Error Alarm
resource "aws_cloudwatch_metric_alarm" "api_5xx_errors" {
  alarm_name          = "eventzr-${var.environment}-taxonomy-api-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "High rate of 5XX errors from API Gateway"
  alarm_actions       = [aws_sns_topic.taxonomy_alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiName  = "eventzr-${var.environment}-api-gateway"
    Resource = "taxonomy"
  }

  tags = local.common_tags
}

# Custom metrics for business KPIs
resource "aws_cloudwatch_log_metric_filter" "taxonomies_created" {
  name           = "eventzr-${var.environment}-taxonomy-taxonomies-created"
  log_group_name = aws_cloudwatch_log_group.lambda_logs.name
  pattern        = "[timestamp, level=\"INFO\", service=\"taxonomy\", message=\"Taxonomy created successfully\", metadata]"

  metric_transformation {
    name      = "TaxonomiesCreated"
    namespace = "EventZr/Taxonomy"
    value     = "1"
    
    default_value = 0
  }
}

resource "aws_cloudwatch_log_metric_filter" "ai_classifications" {
  name           = "eventzr-${var.environment}-taxonomy-ai-classifications"
  log_group_name = aws_cloudwatch_log_group.lambda_logs.name
  pattern        = "[timestamp, level=\"INFO\", service=\"taxonomy\", message=\"AI classification completed\", metadata]"

  metric_transformation {
    name      = "AIClassifications"
    namespace = "EventZr/Taxonomy"
    value     = "1"
    
    default_value = 0
  }
}

# Composite alarm for service health
resource "aws_cloudwatch_composite_alarm" "taxonomy_service_health" {
  alarm_name        = "eventzr-${var.environment}-taxonomy-service-health"
  alarm_description = "Overall health of taxonomy service"
  
  alarm_rule = "ALARM(${aws_cloudwatch_metric_alarm.lambda_error_rate.alarm_name}) OR ALARM(${aws_cloudwatch_metric_alarm.lambda_duration.alarm_name}) OR ALARM(${aws_cloudwatch_metric_alarm.db_cpu.alarm_name}) OR ALARM(${aws_cloudwatch_metric_alarm.api_5xx_errors.alarm_name})"

  alarm_actions = [aws_sns_topic.taxonomy_alerts.arn]
  ok_actions    = [aws_sns_topic.taxonomy_alerts.arn]

  tags = local.common_tags
}

# X-Ray tracing (already enabled in Lambda)
resource "aws_xray_sampling_rule" "taxonomy" {
  rule_name      = "TaxonomyTracing"
  priority       = 9000
  version        = 1
  reservoir_size = 1
  fixed_rate     = var.environment == "production" ? 0.1 : 0.5
  url_path       = "/v1/taxonomy*"
  host           = "*"
  http_method    = "*"
  service_type   = "*"
  service_name   = "*"
  resource_arn   = "*"

  tags = local.common_tags
}



