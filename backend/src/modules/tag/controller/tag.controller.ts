/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3202
 * Tag Controller - REST API Endpoints
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

@ApiTags('tags')
@Controller('v1/taxonomy/tags')
@UseGuards(ThrottlerGuard)
export class TagController {
  constructor() {}

  @Get()
  @ApiOperation({ summary: 'Get all tags with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'namespace', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Tags retrieved successfully' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('namespace') namespace?: string,
    @Query('search') search?: string,
  ) {
    // Mock data for now
    return {
      data: [
        {
          id: '1',
          name: 'rock',
          namespace: 'events',
          usage_count: 150,
          status: 'active',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'concert',
          namespace: 'events',
          usage_count: 320,
          status: 'active',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: '3',
          name: 'outdoor',
          namespace: 'venues',
          usage_count: 85,
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
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiResponse({ status: 200, description: 'Tag retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async findOne(@Param('id') id: string) {
    return {
      id: '1',
      name: 'rock',
      namespace: 'events',
      usage_count: 150,
      status: 'active',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTagDto: any) {
    return {
      id: '4',
      name: createTagDto.name,
      namespace: createTagDto.namespace,
      usage_count: 0,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tag by ID' })
  @ApiResponse({ status: 200, description: 'Tag updated successfully' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async update(@Param('id') id: string, @Body() updateTagDto: any) {
    return {
      id,
      name: updateTagDto.name,
      namespace: updateTagDto.namespace,
      usage_count: 150,
      status: updateTagDto.status || 'active',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tag by ID' })
  @ApiResponse({ status: 204, description: 'Tag deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return;
  }
}
