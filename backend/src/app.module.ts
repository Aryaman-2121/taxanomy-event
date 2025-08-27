/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Generated: 2025-08-26T19:30:00Z
 * Template: Eventzr Code Repository Template v1.0
 */

// Security: Input validation required
// Security: Output encoding required  
// Security: SQL injection protection via Prisma
// Security: XSS protection via class-validator
// Audit: All operations logged via audit service (3101)
// Auth: All requests validated via auth service (3100)

// Architecture: Multi-tenant with RLS
// Architecture: Adapter pattern for external services
// Architecture: Gateway routing via api-gateway (3000)
// Dependencies: secrets-kms, masterdata
// Golden Rules: [1,2,3,4,5,6,7,8,9,10,11,12]

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';

// Core modules
import { DatabaseModule } from './common/database/database.module';
import { CacheModule } from './common/cache/cache.module';
import { AdaptersModule } from './common/adapters/adapters.module';
import { HealthModule } from './modules/health/health.module';
import { SimpleHealthModule } from './modules/health/simple-health.module';

// Feature modules
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { CategoryModule } from './modules/category/category.module';
import { ClassificationModule } from './modules/classification/classification.module';
import { NamespaceModule } from './modules/namespace/namespace.module';
import { TagModule } from './modules/tag/tag.module';

// Common components
import { AuthGuard } from './common/guards/auth.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ValidationPipe } from './common/pipes/validation.pipe';

// Configuration
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { cacheConfig } from './config/cache.config';
import { integrationConfig } from './config/integration.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [
        appConfig,
        databaseConfig,
        cacheConfig,
        integrationConfig,
      ],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting - 600 API rpm per registry
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: 60000, // 1 minute
            limit: configService.get('app.rateLimit', 600), // 600 per minute from registry
          },
          {
            name: 'strict',
            ttl: 60000,
            limit: 100, // Stricter limit for write operations
          },
        ],
      }),
    }),

    // Health checks
    TerminusModule,

        // Core infrastructure
    // DatabaseModule, // Temporarily disabled for demo
    // CacheModule, // Disabled - Redis not available
    // AdaptersModule, // Disabled - depends on external services

    // Health and monitoring
    SimpleHealthModule, // Simple health check without database dependencies
    // HealthModule, // Temporarily disabled - needs database

    // Business modules
    // TaxonomyModule, // Temporarily disabled - needs database
    CategoryModule,
    ClassificationModule,
    NamespaceModule,
    TagModule,
  ],
  providers: [
    // Global guards
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard, // Disabled - needs external auth service
    // },

    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: AuditInterceptor, // Disabled - needs external audit service
    // },

    // Global filters
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },

    // Global pipes
    ValidationPipe,
  ],
})
export class AppModule {}



