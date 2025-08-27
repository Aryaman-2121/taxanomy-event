/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Database Configuration
 * Template: Eventzr Code Repository Template v1.0
 */

import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  // Primary database connection (Cluster 3 from registry)
  url: process.env.DATABASE_URL || 'postgresql://taxonomy:password@localhost:5432/taxonomy_db',
  
  // Connection pool settings
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000', 10),
  idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '600000', 10),
  
  // Query settings
  queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000', 10),
  statementTimeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '60000', 10),
  
  // SSL configuration
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true,
    ca: process.env.DB_CA_CERT,
  } : false,
  
  // Prisma specific
  prisma: {
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    errorFormat: 'pretty',
  },
  
  // Migration settings
  migrationsDir: './database/migrations',
  seedsDir: './database/seeds',
  
  // Performance tuning
  enableQueryLogging: process.env.ENABLE_QUERY_LOGGING === 'true',
  slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000', 10),
  
  // Multi-tenant settings
  enableRLS: process.env.ENABLE_RLS === 'true' || true,
  tenantIdHeader: 'x-tenant-id',
  
  // Backup and maintenance
  enableBackup: process.env.ENABLE_BACKUP === 'true',
  backupSchedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
}));

