# Copyright (c) 2025 Eventful India Marketing Services, India
# All rights reserved.
# 
# Service: taxonomy
# Port: 3201
# Aurora PostgreSQL Configuration - Cluster 3
# Template: Eventzr Code Repository Template v1.0

# DB Subnet Group
resource "aws_db_subnet_group" "taxonomy" {
  name       = "eventzr-${var.environment}-taxonomy-subnet-group"
  subnet_ids = data.aws_subnets.private.ids

  tags = merge(local.common_tags, {
    Name = "eventzr-${var.environment}-taxonomy-db-subnet-group"
  })
}

# Generate random password for database
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Store database password in Secrets Manager
resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "eventzr/${var.environment}/taxonomy/db-credentials"
  description             = "Database credentials for taxonomy service"
  kms_key_id              = aws_kms_key.taxonomy_key.arn
  recovery_window_in_days = var.environment == "production" ? 30 : 0

  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = "taxonomy"
    password = random_password.db_password.result
    engine   = "postgres"
    host     = aws_rds_cluster.taxonomy.endpoint
    port     = aws_rds_cluster.taxonomy.port
    dbname   = aws_rds_cluster.taxonomy.database_name
  })
}

# Aurora PostgreSQL Cluster (Serverless v2)
resource "aws_rds_cluster" "taxonomy" {
  cluster_identifier              = "eventzr-${var.environment}-taxonomy-cluster-3"
  engine                         = "aurora-postgresql"
  engine_mode                    = "provisioned"
  engine_version                 = "15.4"
  database_name                  = "taxonomy_db"
  master_username                = "taxonomy"
  master_password                = random_password.db_password.result
  
  vpc_security_group_ids         = [data.aws_security_group.rds.id]
  db_subnet_group_name           = aws_db_subnet_group.taxonomy.name
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.taxonomy.name
  
  # Backup configuration
  backup_retention_period = var.environment == "production" ? 30 : 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  # Encryption
  storage_encrypted = true
  kms_key_id       = aws_kms_key.taxonomy_key.arn
  
  # Performance Insights
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  # Deletion protection
  deletion_protection      = var.environment == "production"
  skip_final_snapshot     = var.environment != "production"
  final_snapshot_identifier = var.environment == "production" ? "eventzr-${var.environment}-taxonomy-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null
  
  # Serverless v2 scaling configuration
  serverlessv2_scaling_configuration {
    max_capacity = var.environment == "production" ? 16 : 4
    min_capacity = var.environment == "production" ? 2 : 0.5
  }

  tags = merge(local.common_tags, {
    Name = "eventzr-${var.environment}-taxonomy-cluster-3"
    Cluster = "3"
  })

  lifecycle {
    ignore_changes = [master_password]
  }
}

# Aurora PostgreSQL Instance
resource "aws_rds_cluster_instance" "taxonomy" {
  count              = var.environment == "production" ? 2 : 1
  identifier         = "eventzr-${var.environment}-taxonomy-instance-${count.index + 1}"
  cluster_identifier = aws_rds_cluster.taxonomy.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.taxonomy.engine
  engine_version     = aws_rds_cluster.taxonomy.engine_version
  
  performance_insights_enabled    = true
  performance_insights_kms_key_id = aws_kms_key.taxonomy_key.arn
  
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn

  tags = merge(local.common_tags, {
    Name = "eventzr-${var.environment}-taxonomy-instance-${count.index + 1}"
  })
}

# RDS Cluster Parameter Group
resource "aws_rds_cluster_parameter_group" "taxonomy" {
  family = "aurora-postgresql15"
  name   = "eventzr-${var.environment}-taxonomy-cluster-params"

  # Enable logical replication for eventual consistency patterns
  parameter {
    name  = "wal_level"
    value = "logical"
  }

  # Optimize for multi-tenant queries
  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements,auto_explain"
  }

  # Row Level Security (RLS) optimization
  parameter {
    name  = "row_security"
    value = "on"
  }

  # Performance optimization for taxonomy queries
  parameter {
    name  = "work_mem"
    value = "16384"  # 16MB
  }

  parameter {
    name  = "maintenance_work_mem"
    value = "262144"  # 256MB
  }

  # Logging configuration
  parameter {
    name  = "log_statement"
    value = var.environment == "production" ? "none" : "mod"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = var.environment == "production" ? "1000" : "500"  # Log slow queries
  }

  tags = local.common_tags
}

# IAM role for enhanced monitoring
resource "aws_iam_role" "rds_monitoring" {
  name = "eventzr-${var.environment}-taxonomy-rds-monitoring"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# Database proxy for connection pooling
resource "aws_db_proxy" "taxonomy" {
  name                   = "eventzr-${var.environment}-taxonomy-proxy"
  engine_family          = "POSTGRESQL"
  auth {
    auth_scheme = "SECRETS"
    secret_arn  = aws_secretsmanager_secret.db_credentials.arn
  }
  
  role_arn               = aws_iam_role.db_proxy.arn
  vpc_subnet_ids         = data.aws_subnets.private.ids
  require_tls            = true
  idle_client_timeout    = 1800
  max_connections_percent = 100
  max_idle_connections_percent = 50

  target {
    db_cluster_identifier = aws_rds_cluster.taxonomy.cluster_identifier
  }

  tags = local.common_tags
}

# IAM role for DB proxy
resource "aws_iam_role" "db_proxy" {
  name = "eventzr-${var.environment}-taxonomy-db-proxy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "rds.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "db_proxy" {
  name = "eventzr-${var.environment}-taxonomy-db-proxy-policy"
  role = aws_iam_role.db_proxy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = aws_secretsmanager_secret.db_credentials.arn
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = aws_kms_key.taxonomy_key.arn
        Condition = {
          StringEquals = {
            "kms:ViaService" = "secretsmanager.${data.aws_region.current.name}.amazonaws.com"
          }
        }
      }
    ]
  })
}

