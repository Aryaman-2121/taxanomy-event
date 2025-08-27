/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Adapters Module
 * Template: Eventzr Code Repository Template v1.0
 */

import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

import { AuthAdapter } from './auth.adapter';
import { AuditAdapter } from './audit.adapter';
import { ApiGatewayAdapter } from './api-gateway.adapter';
import { CacheAdapter } from './cache.adapter';

@Global()
@Module({
  imports: [
    // JWT Module for token handling
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('app.jwtSecret'),
        signOptions: {
          expiresIn: configService.get('app.jwtExpiresIn'),
        },
      }),
    }),

    // Bull Queue for audit processing
    BullModule.registerQueue({
      name: 'audit',
    }),
  ],
  providers: [
    AuthAdapter,
    AuditAdapter,
    ApiGatewayAdapter,
    CacheAdapter,
  ],
  exports: [
    AuthAdapter,
    AuditAdapter,
    ApiGatewayAdapter,
    CacheAdapter,
  ],
})
export class AdaptersModule {}



