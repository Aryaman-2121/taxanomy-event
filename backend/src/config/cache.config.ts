/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Cache Configuration
 * Template: Eventzr Code Repository Template v1.0
 */

import { registerAs } from '@nestjs/config';

export const cacheConfig = registerAs('cache', () => ({
  // Redis connection
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  
  // Connection settings
  connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10),
  commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT || '5000', 10),
  retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '2000', 10),
  maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
  
  // Pool settings
  maxPoolSize: parseInt(process.env.REDIS_MAX_POOL_SIZE || '10', 10),
  minPoolSize: parseInt(process.env.REDIS_MIN_POOL_SIZE || '2', 10),
  
  // TTL settings (in seconds)
  defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '300', 10), // 5 minutes
  taxonomyTTL: parseInt(process.env.CACHE_TAXONOMY_TTL || '3600', 10), // 1 hour
  categoryTTL: parseInt(process.env.CACHE_CATEGORY_TTL || '1800', 10), // 30 minutes
  classificationTTL: parseInt(process.env.CACHE_CLASSIFICATION_TTL || '300', 10), // 5 minutes
  searchTTL: parseInt(process.env.CACHE_SEARCH_TTL || '600', 10), // 10 minutes
  
  // Cache keys prefix
  keyPrefix: process.env.CACHE_KEY_PREFIX || 'taxonomy:',
  
  // Feature flags
  enabled: process.env.CACHE_ENABLED === 'true' || true,
  enableMetrics: process.env.CACHE_METRICS_ENABLED === 'true',
  enableCompression: process.env.CACHE_COMPRESSION_ENABLED === 'true',
  
  // Performance settings
  maxMemoryPolicy: process.env.REDIS_MAX_MEMORY_POLICY || 'allkeys-lru',
  enablePersistence: process.env.REDIS_ENABLE_PERSISTENCE === 'true',
  
  // Cluster settings (if using Redis Cluster)
  cluster: {
    enabled: process.env.REDIS_CLUSTER_ENABLED === 'true',
    nodes: process.env.REDIS_CLUSTER_NODES?.split(',') || [],
  },
}));
