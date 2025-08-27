/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Namespace Module
 * Template: Eventzr Code Repository Template v1.0
 */

import { Module } from '@nestjs/common';
import { NamespaceController } from './controller/namespace.controller';

@Module({
  controllers: [NamespaceController],
  providers: [],
  exports: [],
})
export class NamespaceModule {}
