/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Integration Configuration
 * Template: Eventzr Code Repository Template v1.0
 */

import { registerAs } from '@nestjs/config';

export const integrationConfig = registerAs('integration', () => ({
  // 12 Golden Rules Service URLs
  apiGateway: {
    baseUrl: process.env.API_GATEWAY_URL || 'http://api-gateway:3000',
    timeout: parseInt(process.env.API_GATEWAY_TIMEOUT || '30000', 10),
    retries: parseInt(process.env.API_GATEWAY_RETRIES || '3', 10),
  },
  
  // Rule 1: Authentication via auth service (3100)
  auth: {
    baseUrl: process.env.AUTH_SERVICE_URL || 'http://auth:3100',
    timeout: parseInt(process.env.AUTH_TIMEOUT || '5000', 10),
    retries: parseInt(process.env.AUTH_RETRIES || '3', 10),
    publicKeyUrl: process.env.AUTH_PUBLIC_KEY_URL,
  },
  
  // Rule 2: Audit via audit service (3101)
  audit: {
    baseUrl: process.env.AUDIT_SERVICE_URL || 'http://audit:3101',
    timeout: parseInt(process.env.AUDIT_TIMEOUT || '10000', 10),
    retries: parseInt(process.env.AUDIT_RETRIES || '3', 10),
    batchSize: parseInt(process.env.AUDIT_BATCH_SIZE || '100', 10),
  },
  
  // Registry dependencies: secrets-kms
  secretsKms: {
    baseUrl: process.env.SECRETS_KMS_URL || 'http://secrets-kms:3902',
    timeout: parseInt(process.env.SECRETS_KMS_TIMEOUT || '10000', 10),
    retries: parseInt(process.env.SECRETS_KMS_RETRIES || '3', 10),
  },
  
  // Registry dependencies: masterdata
  masterdata: {
    baseUrl: process.env.MASTERDATA_URL || 'http://masterdata:3200',
    timeout: parseInt(process.env.MASTERDATA_TIMEOUT || '10000', 10),
    retries: parseInt(process.env.MASTERDATA_RETRIES || '3', 10),
  },
  
  // Rule 5: AI queries via api-gateway → ailabs → mcp-gateway (updated pattern)
  ailabs: {
    baseUrl: process.env.AILABS_URL || 'http://ailabs:3400',
    timeout: parseInt(process.env.AILABS_TIMEOUT || '60000', 10), // Longer for AI processing
    retries: parseInt(process.env.AILABS_RETRIES || '2', 10),
  },
  
  // Rule 4: External APIs via integration-hub
  integrationHub: {
    baseUrl: process.env.INTEGRATION_HUB_URL || 'http://integration-hub:3726',
    timeout: parseInt(process.env.INTEGRATION_HUB_TIMEOUT || '30000', 10),
    retries: parseInt(process.env.INTEGRATION_HUB_RETRIES || '3', 10),
  },
  
  // Circuit breaker settings
  circuitBreaker: {
    enabled: process.env.CIRCUIT_BREAKER_ENABLED === 'true' || true,
    threshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD || '5', 10),
    timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '60000', 10),
    resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT || '30000', 10),
  },
  
  // Retry settings
  retry: {
    maxAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS || '3', 10),
    baseDelay: parseInt(process.env.RETRY_BASE_DELAY || '1000', 10),
    maxDelay: parseInt(process.env.RETRY_MAX_DELAY || '10000', 10),
  },
  
  // Health check intervals
  healthCheck: {
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10),
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000', 10),
  },
}));

