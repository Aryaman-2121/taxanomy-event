/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3202
 * Classification Controller - REST API Endpoints
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

@ApiTags('classifications')
@Controller('v1/taxonomy/classifications')
@UseGuards(ThrottlerGuard)
export class ClassificationController {
  constructor() {}

  @Get()
  @ApiOperation({ summary: 'Get all classifications with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'entity_id', required: false, type: String })
  @ApiQuery({ name: 'category_id', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Classifications retrieved successfully' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('entity_id') entityId?: string,
    @Query('category_id') categoryId?: string,
  ) {
    // Mock data for now
    return {
      data: [
        {
          id: '1',
          entity_id: 'event-123',
          entity_type: 'event',
          category_id: '1',
          category_path: '/music-events',
          confidence: 0.95,
          status: 'confirmed',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: '2',
          entity_id: 'event-123',
          entity_type: 'event',
          category_id: '2',
          category_path: '/music-events/rock-concerts',
          confidence: 0.88,
          status: 'pending',
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
  @ApiOperation({ summary: 'Get classification by ID' })
  @ApiResponse({ status: 200, description: 'Classification retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Classification not found' })
  async findOne(@Param('id') id: string) {
    return {
      id: '1',
      entity_id: 'event-123',
      entity_type: 'event',
      category_id: '1',
      category_path: '/music-events',
      confidence: 0.95,
      status: 'confirmed',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new classification' })
  @ApiResponse({ status: 201, description: 'Classification created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createClassificationDto: any) {
    return {
      id: '3',
      entity_id: createClassificationDto.entity_id,
      entity_type: createClassificationDto.entity_type,
      category_id: createClassificationDto.category_id,
      category_path: '/category/path',
      confidence: createClassificationDto.confidence || 1.0,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update classification by ID' })
  @ApiResponse({ status: 200, description: 'Classification updated successfully' })
  @ApiResponse({ status: 404, description: 'Classification not found' })
  async update(@Param('id') id: string, @Body() updateClassificationDto: any) {
    return {
      id,
      entity_id: updateClassificationDto.entity_id,
      entity_type: updateClassificationDto.entity_type,
      category_id: updateClassificationDto.category_id,
      category_path: '/category/path',
      confidence: updateClassificationDto.confidence || 1.0,
      status: updateClassificationDto.status || 'pending',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete classification by ID' })
  @ApiResponse({ status: 204, description: 'Classification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Classification not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return;
  }
}
