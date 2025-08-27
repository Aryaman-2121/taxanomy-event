/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Cache Module
 * Template: Eventzr Code Repository Template v1.0
 */

import { Module } from '@nestjs/common';
import { CacheAdapter } from '../adapters/cache.adapter';

@Module({
  providers: [CacheAdapter],
  exports: [CacheAdapter],
})
export class CacheModule {}
