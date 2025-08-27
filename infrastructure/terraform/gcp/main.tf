# Copyright (c) 2025 Eventful India Marketing Services, India
# All rights reserved.
# 
# Service: taxonomy
# Port: 3201
# Google Cloud Platform Infrastructure
# Template: Eventzr Code Repository Template v1.0

terraform {
  required_version = ">= 1.5"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    bucket = "eventzr-terraform-state-gcp"
    prefix = "services/taxonomy"
  }
}

# Configure Google Cloud Provider
provider "google" {
  project = var.gcp_project
  region  = var.gcp_region
}

provider "google-beta" {
  project = var.gcp_project
  region  = var.gcp_region
}

# Local values
locals {
  service_name = "taxonomy"
  service_port = "3201"
  
  labels = {
    service     = local.service_name
    port        = local.service_port
    environment = var.environment
    managed-by  = "terraform"
    owner       = "platform-team"
  }
}

# Cloud Run Service
resource "google_cloud_run_service" "taxonomy" {
  name     = "eventzr-${var.environment}-taxonomy"
  location = var.gcp_region

  template {
    metadata {
      labels = local.labels
      annotations = {
        "autoscaling.knative.dev/minScale" = var.environment == "production" ? "3" : "1"
        "autoscaling.knative.dev/maxScale" = var.environment == "production" ? "100" : "10"
        "run.googleapis.com/cloudsql-instances" = google_sql_database_instance.taxonomy.connection_name
        "run.googleapis.com/vpc-access-connector" = google_vpc_access_connector.taxonomy.name
      }
    }

    spec {
      containers {
        image = var.docker_image

        ports {
          container_port = 3201
        }

        env {
          name  = "NODE_ENV"
          value = var.environment
        }

        env {
          name  = "PORT"
          value = "3201"
        }

        env {
          name = "DATABASE_URL"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret_version.db_url.secret
              key  = "latest"
            }
          }
        }

        env {
          name  = "REDIS_HOST"
          value = google_redis_instance.taxonomy.host
        }

        resources {
          limits = {
            cpu    = var.environment == "production" ? "2000m" : "1000m"
            memory = var.environment == "production" ? "4Gi" : "2Gi"
          }
          requests = {
            cpu    = var.environment == "production" ? "1000m" : "500m"
            memory = var.environment == "production" ? "2Gi" : "1Gi"
          }
        }

        startup_probe {
          http_get {
            path = "/health/ready"
            port = 3201
          }
          initial_delay_seconds = 10
          period_seconds       = 3
          timeout_seconds      = 5
          failure_threshold    = 10
        }

        liveness_probe {
          http_get {
            path = "/health/live"
            port = 3201
          }
          initial_delay_seconds = 30
          period_seconds       = 10
          timeout_seconds      = 5
          failure_threshold    = 3
        }
      }

      service_account_name = google_service_account.taxonomy.email
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  lifecycle {
    ignore_changes = [
      template[0].metadata[0].annotations["run.googleapis.com/operation-id"],
    ]
  }
}

# Cloud SQL PostgreSQL instance
resource "google_sql_database_instance" "taxonomy" {
  name             = "eventzr-${var.environment}-taxonomy-db"
  database_version = "POSTGRES_15"
  region           = var.gcp_region

  settings {
    tier              = var.environment == "production" ? "db-custom-4-16384" : "db-custom-2-8192"
    availability_type = var.environment == "production" ? "REGIONAL" : "ZONAL"
    disk_type         = "PD_SSD"
    disk_size         = var.environment == "production" ? 100 : 20

    database_flags {
      name  = "shared_preload_libraries"
      value = "pg_stat_statements,auto_explain"
    }

    database_flags {
      name  = "log_statement"
      value = "mod"
    }

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      location                       = var.gcp_region
      point_in_time_recovery_enabled = true
      backup_retention_settings {
        retained_backups = var.environment == "production" ? 30 : 7
      }
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.self_link
      require_ssl     = true
    }

    maintenance_window {
      day          = 7  # Sunday
      hour         = 4  # 4 AM
      update_track = "stable"
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = true
    }
  }

  deletion_protection = var.environment == "production"

  depends_on = [google_service_networking_connection.private_vpc_connection]
}

# Cloud SQL database
resource "google_sql_database" "taxonomy" {
  name     = "taxonomy_db"
  instance = google_sql_database_instance.taxonomy.name
}

# Cloud SQL user
resource "google_sql_user" "taxonomy" {
  name     = "taxonomy"
  instance = google_sql_database_instance.taxonomy.name
  password = random_password.db_password.result
}

# Memorystore Redis instance
resource "google_redis_instance" "taxonomy" {
  name           = "eventzr-${var.environment}-taxonomy-cache"
  tier           = var.environment == "production" ? "STANDARD_HA" : "BASIC"
  memory_size_gb = var.environment == "production" ? 4 : 1
  region         = var.gcp_region

  authorized_network = google_compute_network.vpc.self_link
  redis_version      = "REDIS_7_0"

  redis_configs = {
    maxmemory-policy = "allkeys-lru"
    timeout         = "300"
  }

  labels = local.labels
}



