/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3202
 * Category Controller - REST API Endpoints
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

@ApiTags('categories')
@Controller('v1/taxonomy/categories')
@UseGuards(ThrottlerGuard)
export class CategoryController {
  constructor() {}

  @Get()
  @ApiOperation({ summary: 'Get all categories with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'namespace', required: false, type: String })
  @ApiQuery({ name: 'entity_type', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('namespace') namespace?: string,
    @Query('entity_type') entityType?: string,
  ) {
    // Mock data for now
    return {
      data: [
        {
          id: '1',
          name: 'Music Events',
          description: 'Events related to music and concerts',
          namespace: 'events',
          entity_type: 'event',
          parent_id: null,
          level: 0,
          path: '/music-events',
          status: 'active',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Rock Concerts',
          description: 'Rock music concerts and festivals',
          namespace: 'events',
          entity_type: 'event',
          parent_id: '1',
          level: 1,
          path: '/music-events/rock-concerts',
          status: 'active',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 2,
        pages: 1,
        has_next: false,
        has_prev: false,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id') id: string) {
    return {
      id: '1',
      name: 'Music Events',
      description: 'Events related to music and concerts',
      namespace: 'events',
      entity_type: 'event',
      parent_id: null,
      level: 0,
      path: '/music-events',
      status: 'active',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoryDto: any) {
    return {
      id: '3',
      name: createCategoryDto.name,
      description: createCategoryDto.description,
      namespace: createCategoryDto.namespace,
      entity_type: createCategoryDto.entity_type,
      parent_id: createCategoryDto.parent_id,
      level: createCategoryDto.parent_id ? 1 : 0,
      path: createCategoryDto.parent_id ? '/parent/child' : '/child',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category by ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(@Param('id') id: string, @Body() updateCategoryDto: any) {
    return {
      id,
      name: updateCategoryDto.name,
      description: updateCategoryDto.description,
      namespace: updateCategoryDto.namespace,
      entity_type: updateCategoryDto.entity_type,
      parent_id: updateCategoryDto.parent_id,
      level: updateCategoryDto.parent_id ? 1 : 0,
      path: updateCategoryDto.parent_id ? '/parent/child' : '/child',
      status: updateCategoryDto.status || 'active',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category by ID' })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return;
  }
}
