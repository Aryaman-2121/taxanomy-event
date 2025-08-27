/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3202
 * Namespace Controller - REST API Endpoints
 * Template: Eventzr Code Repository Template v1.0
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('namespaces')
@Controller('v1/taxonomy/namespaces')
@UseGuards(ThrottlerGuard)
export class NamespaceController {
  constructor() {}

  @Get()
  @ApiOperation({ summary: 'Get all namespaces with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Namespaces retrieved successfully' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('sort') sort: string = 'name',
    @Query('order') order: 'asc' | 'desc' = 'asc',
  ) {
    // Mock data for now
    return {
      data: [
        {
          id: '1',
          name: 'events',
          description: 'Event taxonomy namespace',
          entity_types: ['event', 'workshop', 'conference'],
          status: 'active',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'venues',
          description: 'Venue taxonomy namespace',
          entity_types: ['venue', 'location', 'space'],
          status: 'active',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: '3',
          name: 'content',
          description: 'Content taxonomy namespace',
          entity_types: ['article', 'blog', 'video'],
          status: 'active',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 3,
        pages: 1,
        has_next: false,
        has_prev: false,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get namespace by ID' })
  @ApiResponse({ status: 200, description: 'Namespace retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Namespace not found' })
  async findOne(@Param('id') id: string) {
    return {
      id: '1',
      name: 'events',
      description: 'Event taxonomy namespace',
      entity_types: ['event', 'workshop', 'conference'],
      status: 'active',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new namespace' })
  @ApiResponse({ status: 201, description: 'Namespace created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createNamespaceDto: any) {
    return {
      id: '4',
      name: createNamespaceDto.name,
      description: createNamespaceDto.description,
      entity_types: createNamespaceDto.entity_types || [],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update namespace by ID' })
  @ApiResponse({ status: 200, description: 'Namespace updated successfully' })
  @ApiResponse({ status: 404, description: 'Namespace not found' })
  async update(@Param('id') id: string, @Body() updateNamespaceDto: any) {
    return {
      id,
      name: updateNamespaceDto.name,
      description: updateNamespaceDto.description,
      entity_types: updateNamespaceDto.entity_types || [],
      status: updateNamespaceDto.status || 'active',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete namespace by ID' })
  @ApiResponse({ status: 204, description: 'Namespace deleted successfully' })
  @ApiResponse({ status: 404, description: 'Namespace not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return;
  }
}
