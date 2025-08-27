/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Classification Module
 * Template: Eventzr Code Repository Template v1.0
 */

import { Module } from '@nestjs/common';
import { ClassificationController } from './controller/classification.controller';

@Module({
  controllers: [ClassificationController],
  providers: [],
  exports: [],
})
export class ClassificationModule {}
