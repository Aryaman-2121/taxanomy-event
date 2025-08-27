/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3202
 * Simple Health Module
 * Template: Eventzr Code Repository Template v1.0
 */

import { Module } from '@nestjs/common';
import { SimpleHealthController } from './simple-health.controller';

@Module({
  controllers: [SimpleHealthController],
  providers: [],
  exports: [],
})
export class SimpleHealthModule {}
