/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Database Module
 * Template: Eventzr Code Repository Template v1.0
 */

import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    DatabaseService,
    PrismaService,
    {
      provide: 'DATABASE_CONFIG',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('database'),
    },
  ],
  exports: [DatabaseService, PrismaService],
})
export class DatabaseModule {}



