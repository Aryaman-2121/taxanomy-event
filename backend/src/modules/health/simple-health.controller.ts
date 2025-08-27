/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3202
 * Simple Health Controller
 * Template: Eventzr Code Repository Template v1.0
 */

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class SimpleHealthController {
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'taxonomy',
      port: 3202,
    };
  }

  @Get('v1/taxonomy/health')
  @ApiOperation({ summary: 'API health check endpoint' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  apiHealthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'taxonomy-api',
      version: 'v1',
      port: 3202,
    };
  }
}
