/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Category Module
 * Template: Eventzr Code Repository Template v1.0
 */

import { Module } from '@nestjs/common';
import { CategoryController } from './controller/category.controller';

@Module({
  controllers: [CategoryController],
  providers: [],
  exports: [],
})
export class CategoryModule {}
