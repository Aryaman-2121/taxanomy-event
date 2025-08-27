# Copyright (c) 2025 Eventful India Marketing Services, India
# All rights reserved.
# 
# Service: taxonomy
# Port: 3201
# Microsoft Azure Infrastructure
# Template: Eventzr Code Repository Template v1.0

terraform {
  required_version = ">= 1.5"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 2.46"
    }
  }

  backend "azurerm" {
    resource_group_name  = "eventzr-terraform-state"
    storage_account_name = "eventzrterraformstate"
    container_name       = "tfstate"
    key                  = "services/taxonomy/terraform.tfstate"
  }
}

# Configure Azure Provider
provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy = true
    }
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "eventzr-${var.environment}-taxonomy"
  location = var.azure_location

  tags = {
    service     = "taxonomy"
    port        = "3201"
    environment = var.environment
    managed-by  = "terraform"
    owner       = "platform-team"
  }
}

# Container App Environment
resource "azurerm_container_app_environment" "main" {
  name                     = "eventzr-${var.environment}-taxonomy-env"
  location                 = azurerm_resource_group.main.location
  resource_group_name      = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  tags = azurerm_resource_group.main.tags
}

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "main" {
  name                = "eventzr-${var.environment}-taxonomy-logs"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = var.environment == "production" ? 90 : 30

  tags = azurerm_resource_group.main.tags
}

# Container App
resource "azurerm_container_app" "taxonomy" {
  name                         = "eventzr-${var.environment}-taxonomy"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode               = "Single"

  template {
    container {
      name   = "taxonomy"
      image  = var.docker_image
      cpu    = var.environment == "production" ? 2.0 : 1.0
      memory = var.environment == "production" ? "4Gi" : "2Gi"

      env {
        name  = "NODE_ENV"
        value = var.environment
      }

      env {
        name  = "PORT"
        value = "3201"
      }

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }

      env {
        name  = "REDIS_HOST"
        value = azurerm_redis_cache.taxonomy.hostname
      }

      startup_probe {
        transport = "HTTP"
        port      = 3201
        path      = "/health/ready"

        initial_delay           = 10
        interval_seconds       = 3
        timeout                = 5
        failure_count_threshold = 10
      }

      liveness_probe {
        transport = "HTTP"
        port      = 3201
        path      = "/health/live"

        initial_delay           = 30
        interval_seconds       = 10
        timeout                = 5
        failure_count_threshold = 3
      }
    }

    min_replicas = var.environment == "production" ? 3 : 1
    max_replicas = var.environment == "production" ? 100 : 10
  }

  secret {
    name  = "database-url"
    value = "postgresql://${azurerm_postgresql_flexible_server.taxonomy.administrator_login}:${random_password.db_password.result}@${azurerm_postgresql_flexible_server.taxonomy.fqdn}:5432/${azurerm_postgresql_flexible_server_database.taxonomy.name}"
  }

  ingress {
    allow_insecure_connections = false
    external_enabled          = true
    target_port              = 3201

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  identity {
    type = "SystemAssigned"
  }

  tags = azurerm_resource_group.main.tags
}

# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "taxonomy" {
  name                   = "eventzr-${var.environment}-taxonomy-db"
  resource_group_name    = azurerm_resource_group.main.name
  location              = azurerm_resource_group.main.location
  version               = "15"
  delegated_subnet_id   = azurerm_subnet.database.id
  private_dns_zone_id   = azurerm_private_dns_zone.postgres.id
  administrator_login   = "taxonomy"
  administrator_password = random_password.db_password.result
  zone                  = "1"

  storage_mb = var.environment == "production" ? 102400 : 32768  # 100GB or 32GB

  sku_name = var.environment == "production" ? "GP_Standard_D4s_v3" : "GP_Standard_D2s_v3"

  backup_retention_days        = var.environment == "production" ? 30 : 7
  geo_redundant_backup_enabled = var.environment == "production"

  maintenance_window {
    day_of_week  = 0  # Sunday
    start_hour   = 4  # 4 AM
    start_minute = 0
  }

  depends_on = [azurerm_private_dns_zone_virtual_network_link.postgres]

  tags = azurerm_resource_group.main.tags
}

# PostgreSQL Database
resource "azurerm_postgresql_flexible_server_database" "taxonomy" {
  name      = "taxonomy_db"
  server_id = azurerm_postgresql_flexible_server.taxonomy.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# Redis Cache
resource "azurerm_redis_cache" "taxonomy" {
  name                = "eventzr-${var.environment}-taxonomy-cache"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  capacity            = var.environment == "production" ? 2 : 1
  family              = var.environment == "production" ? "P" : "C"
  sku_name            = var.environment == "production" ? "Premium" : "Standard"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"

  redis_configuration {
    maxmemory_reserved = var.environment == "production" ? 200 : 30
    maxmemory_delta    = var.environment == "production" ? 200 : 30
    maxmemory_policy   = "allkeys-lru"
  }

  tags = azurerm_resource_group.main.tags
}



