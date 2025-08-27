/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Tag Module
 * Template: Eventzr Code Repository Template v1.0
 */

import { Module } from '@nestjs/common';
import { TagController } from './controller/tag.controller';

@Module({
  controllers: [TagController],
  providers: [],
  exports: [],
})
export class TagModule {}
