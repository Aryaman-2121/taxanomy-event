# Copyright (c) 2025 Eventful India Marketing Services, India
# All rights reserved.
# 
# Service: taxonomy
# Port: 3201
# API Gateway Integration
# Template: Eventzr Code Repository Template v1.0

# API Gateway Lambda permission
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.taxonomy.function_name
  principal     = "apigateway.amazonaws.com"
  qualifier     = aws_lambda_alias.taxonomy_live.name
  
  source_arn = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${data.aws_api_gateway_rest_api.main.id}/*/*/*"
}

# Get existing API Gateway
data "aws_api_gateway_rest_api" "main" {
  name = "eventzr-${var.environment}-api-gateway"
}

data "aws_api_gateway_resource" "root" {
  rest_api_id = data.aws_api_gateway_rest_api.main.id
  path        = "/"
}

# Create taxonomy resource
resource "aws_api_gateway_resource" "taxonomy" {
  rest_api_id = data.aws_api_gateway_rest_api.main.id
  parent_id   = data.aws_api_gateway_resource.root.id
  path_part   = "taxonomy"
}

# Create proxy resource for all taxonomy paths
resource "aws_api_gateway_resource" "taxonomy_proxy" {
  rest_api_id = data.aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.taxonomy.id
  path_part   = "{proxy+}"
}

# API Gateway method for taxonomy root
resource "aws_api_gateway_method" "taxonomy_any" {
  rest_api_id   = data.aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.taxonomy.id
  http_method   = "ANY"
  authorization = "NONE"

  request_parameters = {
    "method.request.header.X-Tenant-ID"      = false
    "method.request.header.X-Correlation-ID" = false
  }
}

# API Gateway method for taxonomy proxy
resource "aws_api_gateway_method" "taxonomy_proxy_any" {
  rest_api_id   = data.aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.taxonomy_proxy.id
  http_method   = "ANY"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy"               = true
    "method.request.header.X-Tenant-ID"      = false
    "method.request.header.X-Correlation-ID" = false
  }
}

# API Gateway integration for taxonomy root
resource "aws_api_gateway_integration" "taxonomy" {
  rest_api_id = data.aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.taxonomy.id
  http_method = aws_api_gateway_method.taxonomy_any.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.name}:lambda:path/2015-03-31/functions/${aws_lambda_function.taxonomy.arn}:${aws_lambda_alias.taxonomy_live.name}/invocations"

  # Connection pooling for better performance
  connection_type = "INTERNET"
  timeout_milliseconds = 29000  # Just under 30s API Gateway limit

  request_templates = {
    "application/json" = ""
  }
}

# API Gateway integration for taxonomy proxy
resource "aws_api_gateway_integration" "taxonomy_proxy" {
  rest_api_id = data.aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.taxonomy_proxy.id
  http_method = aws_api_gateway_method.taxonomy_proxy_any.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.name}:lambda:path/2015-03-31/functions/${aws_lambda_function.taxonomy.arn}:${aws_lambda_alias.taxonomy_live.name}/invocations"

  connection_type = "INTERNET"
  timeout_milliseconds = 29000

  request_templates = {
    "application/json" = ""
  }

  request_parameters = {
    "integration.request.path.proxy" = "method.request.path.proxy"
  }
}

# Request validator
resource "aws_api_gateway_request_validator" "taxonomy" {
  name                        = "taxonomy-validator"
  rest_api_id                 = data.aws_api_gateway_rest_api.main.id
  validate_request_body       = true
  validate_request_parameters = true
}

# API Gateway deployment (managed by central API Gateway)
data "aws_api_gateway_deployment" "main" {
  rest_api_id = data.aws_api_gateway_rest_api.main.id
  stage_name  = var.environment
}

# Usage plan association
data "aws_api_gateway_usage_plan" "main" {
  name = "eventzr-${var.environment}-usage-plan"
}

# Throttling settings for taxonomy endpoints
resource "aws_api_gateway_method_settings" "taxonomy" {
  rest_api_id = data.aws_api_gateway_rest_api.main.id
  stage_name  = data.aws_api_gateway_deployment.main.stage_name
  method_path = "taxonomy/*"

  settings {
    # Registry requirement: 600 rpm = 10 rps
    throttling_rate_limit  = 10
    throttling_burst_limit = 20
    
    # Performance monitoring
    metrics_enabled        = true
    data_trace_enabled     = var.environment != "production"
    logging_level         = var.environment == "production" ? "ERROR" : "INFO"
    
    # Caching (disabled for data freshness)
    caching_enabled = false
  }
}

# CloudWatch Log Group for API Gateway logs
resource "aws_cloudwatch_log_group" "api_gateway_logs" {
  name              = "/aws/apigateway/eventzr-${var.environment}-taxonomy"
  retention_in_days = local.current_config.log_retention
  kms_key_id        = aws_kms_key.taxonomy_key.arn

  tags = local.common_tags
}

