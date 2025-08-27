/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Application Configuration
 * Template: Eventzr Code Repository Template v1.0
 */

import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  // Service identity
  name: 'taxonomy',
  port: parseInt(process.env.PORT || '3201', 10),
  environment: process.env.NODE_ENV || 'development',
  version: process.env.npm_package_version || '1.0.0',

  // Registry compliance
  publicUrl: process.env.PUBLIC_URL || 'https://api.eventzr.com/v1/taxonomy',
  rateLimit: parseInt(process.env.RATE_LIMIT || '600', 10), // 600 api_rpm from registry

  // Security
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['https://app.eventzr.com'],
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',

  // Feature flags
  enableSwagger: process.env.ENABLE_SWAGGER === 'true' || process.env.NODE_ENV !== 'production',
  enableMetrics: process.env.ENABLE_METRICS === 'true',
  enableTracing: process.env.ENABLE_TRACING === 'true',

  // Performance
  maxBodySize: process.env.MAX_BODY_SIZE || '10mb',
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),

  // Multi-tenancy
  defaultTenant: process.env.DEFAULT_TENANT_ID || 'default',
  enforceRLS: process.env.ENFORCE_RLS === 'true' || true,

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logFormat: process.env.LOG_FORMAT || 'json',

  // AWS specific
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  stage: process.env.STAGE || 'dev',
}));
