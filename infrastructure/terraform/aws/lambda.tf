# Copyright (c) 2025 Eventful India Marketing Services, India
# All rights reserved.
# 
# Service: taxonomy
# Port: 3201
# AWS Lambda Configuration
# Template: Eventzr Code Repository Template v1.0

# Lambda execution role
resource "aws_iam_role" "lambda_execution_role" {
  name = "eventzr-${var.environment}-taxonomy-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

# Lambda execution policy
resource "aws_iam_role_policy" "lambda_execution_policy" {
  name = "eventzr-${var.environment}-taxonomy-lambda-policy"
  role = aws_iam_role.lambda_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/eventzr-${var.environment}-taxonomy*"
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface",
          "ec2:AttachNetworkInterface",
          "ec2:DetachNetworkInterface"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "rds:DescribeDBClusters",
          "rds:DescribeDBInstances"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "elasticache:DescribeCacheClusters",
          "elasticache:DescribeReplicationGroups"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          aws_secretsmanager_secret.db_credentials.arn,
          "arn:aws:secretsmanager:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:secret:eventzr/${var.environment}/taxonomy/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey"
        ]
        Resource = [
          aws_kms_key.taxonomy_key.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "xray:PutTraceSegments",
          "xray:PutTelemetryRecords"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Resource = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/eventzr/${var.environment}/taxonomy/*"
      }
    ]
  })
}

# Attach AWS managed policies
resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_insights" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLambdaInsightsExecutionRolePolicy"
}

# Lambda function
resource "aws_lambda_function" "taxonomy" {
  filename         = var.lambda_zip_path
  function_name    = "eventzr-${var.environment}-taxonomy"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "main.handler"
  source_code_hash = filebase64sha256(var.lambda_zip_path)
  runtime         = "nodejs20.x"
  timeout         = local.current_config.lambda_timeout
  memory_size     = local.current_config.lambda_memory
  
  vpc_config {
    subnet_ids         = data.aws_subnets.private.ids
    security_group_ids = [data.aws_security_group.lambda.id]
  }

  environment {
    variables = {
      NODE_ENV              = var.environment
      PORT                  = local.service_port
      DATABASE_URL          = "postgresql://${aws_rds_cluster.taxonomy.master_username}:${random_password.db_password.result}@${aws_rds_cluster.taxonomy.endpoint}:${aws_rds_cluster.taxonomy.port}/${aws_rds_cluster.taxonomy.database_name}?schema=public"
      REDIS_HOST           = aws_elasticache_replication_group.taxonomy.primary_endpoint_address
      REDIS_PORT           = aws_elasticache_replication_group.taxonomy.port
      AWS_REGION           = data.aws_region.current.name
      LOG_LEVEL            = var.environment == "production" ? "warn" : "info"
      ENABLE_TRACING       = "true"
      
      # Service integration URLs
      API_GATEWAY_URL      = "https://${var.api_gateway_domain}"
      AUTH_SERVICE_URL     = "https://${var.api_gateway_domain}/v1/auth"
      AUDIT_SERVICE_URL    = "https://${var.api_gateway_domain}/v1/audit"
      SECRETS_KMS_URL      = "https://${var.api_gateway_domain}/v1/secrets-kms"
      MASTERDATA_URL       = "https://${var.api_gateway_domain}/v1/masterdata"
      AILABS_URL           = "https://${var.api_gateway_domain}/v1/ailabs"
      INTEGRATION_HUB_URL  = "https://${var.api_gateway_domain}/v1/integration-hub"
      
      # Security
      JWT_SECRET_ARN       = aws_secretsmanager_secret.jwt_secret.arn
      
      # Feature flags
      ENABLE_SWAGGER       = var.environment != "production" ? "true" : "false"
      ENABLE_METRICS       = "true"
      
      # Performance
      CACHE_ENABLED        = "true"
      CIRCUIT_BREAKER_ENABLED = "true"
    }
  }

  tracing_config {
    mode = "Active"
  }

  layers = [
    "arn:aws:lambda:${data.aws_region.current.name}:580247275435:layer:LambdaInsightsExtension:49"
  ]

  depends_on = [
    aws_iam_role_policy_attachment.lambda_vpc_access,
    aws_cloudwatch_log_group.lambda_logs,
  ]

  tags = local.common_tags
}

# Lambda alias for blue-green deployments
resource "aws_lambda_alias" "taxonomy_live" {
  name             = "live"
  description      = "Live alias for taxonomy Lambda function"
  function_name    = aws_lambda_function.taxonomy.function_name
  function_version = "$LATEST"

  tags = local.common_tags
}

# Lambda provisioned concurrency for production
resource "aws_lambda_provisioned_concurrency_config" "taxonomy" {
  count                             = var.environment == "production" ? 1 : 0
  function_name                     = aws_lambda_function.taxonomy.function_name
  provisioned_concurrent_executions = local.current_config.min_capacity
  qualifier                        = aws_lambda_alias.taxonomy_live.name
}

# Lambda auto-scaling
resource "aws_application_autoscaling_target" "taxonomy_lambda" {
  max_capacity       = local.current_config.max_capacity
  min_capacity       = local.current_config.min_capacity
  resource_id        = "function:${aws_lambda_function.taxonomy.function_name}:${aws_lambda_alias.taxonomy_live.name}"
  scalable_dimension = "lambda:function:ProvisionedConcurrency"
  service_namespace  = "lambda"
}

resource "aws_application_autoscaling_policy" "taxonomy_lambda_scale_up" {
  name               = "taxonomy-scale-up"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_application_autoscaling_target.taxonomy_lambda.resource_id
  scalable_dimension = aws_application_autoscaling_target.taxonomy_lambda.scalable_dimension
  service_namespace  = aws_application_autoscaling_target.taxonomy_lambda.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "LambdaProvisionedConcurrencyUtilization"
    }
    target_value = 70.0
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/eventzr-${var.environment}-taxonomy"
  retention_in_days = local.current_config.log_retention
  kms_key_id        = aws_kms_key.taxonomy_key.arn

  tags = local.common_tags
}

