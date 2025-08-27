/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Taxonomy Controller
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
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';

import { TaxonomyService } from '../services/taxonomy.service';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { CreateTaxonomyDto } from '../dto/create-taxonomy.dto';
import { UpdateTaxonomyDto } from '../dto/update-taxonomy.dto';
import { TaxonomyResponseDto } from '../dto/taxonomy-response.dto';
import { TaxonomyQueryDto } from '../dto/taxonomy-query.dto';
import { BulkOperationDto } from '../dto/bulk-operation.dto';
import { StandardResponseDto } from '../../../common/dto/standard-response.dto';
import { RequestContext, RequestWithContext } from '../../../common/interfaces/request-context.interface';

@ApiTags('taxonomy')
@Controller('taxonomy')
@UseGuards(AuthGuard, TenantGuard)
@ApiBearerAuth('JWT-auth')
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new taxonomy' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Taxonomy created successfully',
    type: TaxonomyResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Authentication required' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // Stricter limit for create operations
  async create(
    @Body() createTaxonomyDto: CreateTaxonomyDto,
    @Req() req: RequestWithContext
  ): Promise<StandardResponseDto<TaxonomyResponseDto>> {
    const context = req.context as RequestContext;
    const taxonomy = await this.taxonomyService.create(createTaxonomyDto, context);
    
    return {
      success: true,
      data: taxonomy,
      message: 'Taxonomy created successfully',
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'List taxonomies with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Taxonomies retrieved successfully',
    type: [TaxonomyResponseDto],
  })
  @ApiQuery({ name: 'namespace', required: false, description: 'Filter by namespace' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  async findAll(
    @Query() query: TaxonomyQueryDto,
    @Req() req: RequestWithContext
  ): Promise<StandardResponseDto<TaxonomyResponseDto[]>> {
    const context = req.context as RequestContext;
    const result = await this.taxonomyService.findAll(query, context);
    
    return {
      success: true,
      data: result.items,
      message: 'Taxonomies retrieved successfully',
      metadata: {
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get taxonomy by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Taxonomy retrieved successfully',
    type: TaxonomyResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Taxonomy not found' })
  @ApiParam({ name: 'id', description: 'Taxonomy UUID' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithContext
  ): Promise<StandardResponseDto<TaxonomyResponseDto>> {
    const context = req.context as RequestContext;
    const taxonomy = await this.taxonomyService.findOne(id, context);
    
    return {
      success: true,
      data: taxonomy,
      message: 'Taxonomy retrieved successfully',
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update taxonomy' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Taxonomy updated successfully',
    type: TaxonomyResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Taxonomy not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiParam({ name: 'id', description: 'Taxonomy UUID' })
  @Throttle({ default: { limit: 200, ttl: 60000 } })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaxonomyDto: UpdateTaxonomyDto,
    @Req() req: RequestWithContext
  ): Promise<StandardResponseDto<TaxonomyResponseDto>> {
    const context = req.context as RequestContext;
    const taxonomy = await this.taxonomyService.update(id, updateTaxonomyDto, context);
    
    return {
      success: true,
      data: taxonomy,
      message: 'Taxonomy updated successfully',
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete taxonomy' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Taxonomy deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Taxonomy not found' })
  @ApiParam({ name: 'id', description: 'Taxonomy UUID' })
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // Stricter limit for delete operations
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithContext
  ): Promise<StandardResponseDto<null>> {
    const context = req.context as RequestContext;
    await this.taxonomyService.remove(id, context);
    
    return {
      success: true,
      data: null,
      message: 'Taxonomy deleted successfully',
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  }

  @Get(':id/categories')
  @ApiOperation({ summary: 'Get taxonomy categories as tree' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category tree retrieved successfully' })
  @ApiParam({ name: 'id', description: 'Taxonomy UUID' })
  async getCategoryTree(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithContext,
    @Query('maxDepth') maxDepth?: number
  ): Promise<StandardResponseDto<any[]>> {
    const context = req.context as RequestContext;
    const tree = await this.taxonomyService.getCategoryTree(id, context, maxDepth);
    
    return {
      success: true,
      data: tree,
      message: 'Category tree retrieved successfully',
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  }

  @Post(':id/clone')
  @ApiOperation({ summary: 'Clone taxonomy with all categories' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Taxonomy cloned successfully',
    type: TaxonomyResponseDto,
  })
  @ApiParam({ name: 'id', description: 'Source taxonomy UUID' })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // Very strict limit for expensive operations
  async clone(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithContext,
    @Body('name') name: string,
    @Body('namespace') namespace?: string
  ): Promise<StandardResponseDto<TaxonomyResponseDto>> {
    const context = req.context as RequestContext;
    const clonedTaxonomy = await this.taxonomyService.clone(id, name, context, namespace);
    
    return {
      success: true,
      data: clonedTaxonomy,
      message: 'Taxonomy cloned successfully',
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk operations on taxonomies' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Bulk operation completed successfully' })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Very strict limit for bulk operations
  async bulkOperation(
    @Body() bulkDto: BulkOperationDto,
    @Req() req: RequestWithContext
  ): Promise<StandardResponseDto<any>> {
    const context = req.context as RequestContext;
    const result = await this.taxonomyService.bulkOperation(bulkDto, context);
    
    return {
      success: true,
      data: result,
      message: 'Bulk operation completed successfully',
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  }

  @Get(':id/export')
  @ApiOperation({ summary: 'Export taxonomy structure' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Taxonomy exported successfully' })
  @ApiParam({ name: 'id', description: 'Taxonomy UUID' })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv', 'xlsx'], description: 'Export format' })
  async export(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('format') format: 'json' | 'csv' | 'xlsx' = 'json',
    @Req() req: RequestWithContext
  ): Promise<StandardResponseDto<any>> {
    const context = req.context as RequestContext;
    const exportData = await this.taxonomyService.export(id, format, context);
    
    return {
      success: true,
      data: exportData,
      message: 'Taxonomy exported successfully',
      metadata: {
        format: format,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  }
}
