/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Taxonomy Business Service
 * Template: Eventzr Code Repository Template v1.0
 */

import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Taxonomy, TaxonomyStatus } from '@prisma/client';

import { TaxonomyRepository } from '../repositories/taxonomy.repository';
import { AuthAdapter } from '../../../common/adapters/auth.adapter';
import { AuditAdapter } from '../../../common/adapters/audit.adapter';
import { CacheAdapter } from '../../../common/adapters/cache.adapter';
import { ApiGatewayAdapter } from '../../../common/adapters/api-gateway.adapter';

import { CreateTaxonomyDto } from '../dto/create-taxonomy.dto';
import { UpdateTaxonomyDto } from '../dto/update-taxonomy.dto';
import { TaxonomyResponseDto } from '../dto/taxonomy-response.dto';
import { TaxonomyQueryDto } from '../dto/taxonomy-query.dto';
import { BulkOperationDto } from '../dto/bulk-operation.dto';
import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';
import { RequestContext } from '../../../common/interfaces/request-context.interface';

@Injectable()
export class TaxonomyService {
  private readonly logger = new Logger(TaxonomyService.name);

  constructor(
    private readonly taxonomyRepository: TaxonomyRepository,
    private readonly authAdapter: AuthAdapter,
    private readonly auditAdapter: AuditAdapter,
    private readonly cacheAdapter: CacheAdapter,
    private readonly apiGatewayAdapter: ApiGatewayAdapter,
  ) {}

  /**
   * Create a new taxonomy
   */
  async create(
    createTaxonomyDto: CreateTaxonomyDto,
    context: RequestContext
  ): Promise<TaxonomyResponseDto> {
    const correlationId = context.correlationId;
    this.logger.log('Creating taxonomy', {
      namespace: createTaxonomyDto.namespace,
      name: createTaxonomyDto.name,
      tenantId: context.tenantId,
      correlationId,
    });

    try {
      // 1. Validate tenant access
      await this.authAdapter.validateTenantAccess(context.tenantId, context.userId);

      // 2. Check if taxonomy with same slug exists in namespace
      await this.validateUniqueness(
        createTaxonomyDto.namespace,
        createTaxonomyDto.slug,
        context.tenantId
      );

      // 3. Validate namespace quota if applicable
      await this.validateNamespaceQuota(createTaxonomyDto.namespace, context.tenantId);

      // 4. Create taxonomy with transaction
      const taxonomy = await this.taxonomyRepository.transaction(async (tx) => {
        const newTaxonomy = await tx.create({
          tenant_id: context.tenantId,
          namespace: createTaxonomyDto.namespace,
          name: createTaxonomyDto.name,
          slug: createTaxonomyDto.slug,
          description: createTaxonomyDto.description,
          status: createTaxonomyDto.status || TaxonomyStatus.draft,
          is_hierarchical: createTaxonomyDto.isHierarchical ?? true,
          max_depth: createTaxonomyDto.maxDepth || 6,
          metadata: createTaxonomyDto.metadata || {},
          created_by: context.userId,
          updated_by: context.userId,
        });

        // 5. Audit logging (Golden Rule #2)
        await this.auditAdapter.logTaxonomyCreated(
          context.tenantId,
          context.userId,
          newTaxonomy,
          {
            correlationId,
            source: 'taxonomy.service',
            action: 'create',
          }
        );

        return newTaxonomy;
      });

      // 6. Invalidate relevant caches
      await this.invalidateCaches(context.tenantId, [createTaxonomyDto.namespace]);

      // 7. Transform to response DTO
      const response = this.transformToResponseDto(taxonomy);

      this.logger.log('Taxonomy created successfully', {
        taxonomyId: taxonomy.id,
        tenantId: context.tenantId,
        correlationId,
      });

      return response;
    } catch (error) {
      this.logger.error('Taxonomy creation failed', {
        error: (error as Error).message,
        tenantId: context.tenantId,
        correlationId,
      });

      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }

      throw new BadRequestException({
        code: 'TAXONOMY_CREATION_FAILED',
        message: 'Failed to create taxonomy',
        correlationId,
      });
    }
  }

  /**
   * Find all taxonomies with filtering and pagination
   */
  async findAll(
    query: TaxonomyQueryDto,
    context: RequestContext
  ): Promise<PaginatedResponse<TaxonomyResponseDto>> {
    try {
      // Check cache first
      const cacheKey = `taxonomies:list:${JSON.stringify(query)}:${context.tenantId}`;
      const cached = await this.cacheAdapter.get<PaginatedResponse<TaxonomyResponseDto>>(cacheKey);
      
      if (cached) {
        this.logger.debug('Returning cached taxonomy list', {
          tenantId: context.tenantId,
          correlationId: context.correlationId,
        });
        return cached;
      }

      // Fetch from database
      const result = await this.taxonomyRepository.findAllPaginated(query, context.tenantId);

      // Transform to response DTOs
      const responseData: PaginatedResponse<TaxonomyResponseDto> = {
        items: result.items.map(item => this.transformToResponseDto(item)),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      };

      // Cache results
      await this.cacheAdapter.set(cacheKey, responseData, { ttl: 300 }); // 5 minutes

      return responseData;
    } catch (error) {
      this.logger.error('Failed to fetch taxonomies', {
        error: (error as Error).message,
        tenantId: context.tenantId,
        correlationId: context.correlationId,
      });

      throw new BadRequestException({
        code: 'TAXONOMY_FETCH_FAILED',
        message: 'Failed to fetch taxonomies',
        correlationId: context.correlationId,
      });
    }
  }

  /**
   * Find taxonomy by ID
   */
  async findOne(id: string, context: RequestContext): Promise<TaxonomyResponseDto> {
    try {
      // Check cache first
      const cached = await this.cacheAdapter.get<TaxonomyResponseDto>(
        `taxonomy:${id}:${context.tenantId}`
      );
      
      if (cached) {
        return cached;
      }

      // Fetch from database
      const taxonomy = await this.taxonomyRepository.findById(id, context.tenantId);
      
      if (!taxonomy) {
        throw new NotFoundException({
          code: 'TAXONOMY_NOT_FOUND',
          message: 'Taxonomy not found',
          correlationId: context.correlationId,
        });
      }

      const response = this.transformToResponseDto(taxonomy);
      
      // Cache the result
      await this.cacheAdapter.set(`taxonomy:${id}:${context.tenantId}`, response, { ttl: 1800 });

      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error('Failed to fetch taxonomy', {
        taxonomyId: id,
        error: (error as Error).message,
        tenantId: context.tenantId,
        correlationId: context.correlationId,
      });

      throw new BadRequestException({
        code: 'TAXONOMY_FETCH_FAILED',
        message: 'Failed to fetch taxonomy',
        correlationId: context.correlationId,
      });
    }
  }

  /**
   * Update taxonomy
   */
  async update(
    id: string,
    updateTaxonomyDto: UpdateTaxonomyDto,
    context: RequestContext
  ): Promise<TaxonomyResponseDto> {
    const correlationId = context.correlationId;

    try {
      // 1. Validate tenant access and get current taxonomy
      const currentTaxonomy = await this.taxonomyRepository.findById(id, context.tenantId);
      
      if (!currentTaxonomy) {
        throw new NotFoundException({
          code: 'TAXONOMY_NOT_FOUND',
          message: 'Taxonomy not found',
          correlationId,
        });
      }

      // 2. Check permissions for system taxonomies
      if (currentTaxonomy.is_system && !await this.hasAdminPermissions(context)) {
        throw new ForbiddenException({
          code: 'SYSTEM_TAXONOMY_MODIFICATION_DENIED',
          message: 'Cannot modify system taxonomies',
          correlationId,
        });
      }

      // 3. Validate slug uniqueness if changing
      if (updateTaxonomyDto.slug && updateTaxonomyDto.slug !== currentTaxonomy.slug) {
        await this.validateUniqueness(
          currentTaxonomy.namespace,
          updateTaxonomyDto.slug,
          context.tenantId,
          id
        );
      }

      // 4. Update taxonomy with transaction
      const updatedTaxonomy = await this.taxonomyRepository.transaction(async (tx) => {
        const updated = await tx.update(id, updateTaxonomyDto, context.userId);

        // 5. Audit logging (Golden Rule #2)
        await this.auditAdapter.logTaxonomyUpdated(
          context.tenantId,
          context.userId,
          id,
          this.extractAuditableFields(currentTaxonomy),
          this.extractAuditableFields(updateTaxonomyDto),
          {
            correlationId,
            source: 'taxonomy.service',
            action: 'update',
          }
        );

        return updated;
      });

      // 6. Invalidate caches
      await this.invalidateCaches(context.tenantId, [currentTaxonomy.namespace]);
      await this.cacheAdapter.del(`taxonomy:${id}:${context.tenantId}`);

      const response = this.transformToResponseDto(updatedTaxonomy);

      this.logger.log('Taxonomy updated successfully', {
        taxonomyId: id,
        tenantId: context.tenantId,
        correlationId,
      });

      return response;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error('Taxonomy update failed', {
        taxonomyId: id,
        error: (error as Error).message,
        tenantId: context.tenantId,
        correlationId,
      });

      throw new BadRequestException({
        code: 'TAXONOMY_UPDATE_FAILED',
        message: 'Failed to update taxonomy',
        correlationId,
      });
    }
  }

  /**
   * Delete taxonomy
   */
  async remove(id: string, context: RequestContext): Promise<void> {
    const correlationId = context.correlationId;

    try {
      // 1. Get current taxonomy and validate
      const taxonomy = await this.taxonomyRepository.findById(id, context.tenantId);
      
      if (!taxonomy) {
        throw new NotFoundException({
          code: 'TAXONOMY_NOT_FOUND',
          message: 'Taxonomy not found',
          correlationId,
        });
      }

      // 2. Check if it's a system taxonomy
      if (taxonomy.is_system) {
        throw new ForbiddenException({
          code: 'SYSTEM_TAXONOMY_DELETION_DENIED',
          message: 'Cannot delete system taxonomies',
          correlationId,
        });
      }

      // 3. Check for dependent classifications
      const dependentCount = await this.taxonomyRepository.countDependentClassifications(id);
      if (dependentCount > 0) {
        throw new BadRequestException({
          code: 'TAXONOMY_HAS_DEPENDENCIES',
          message: `Cannot delete taxonomy with ${dependentCount} active classifications`,
          correlationId,
        });
      }

      // 4. Soft delete with transaction
      await this.taxonomyRepository.transaction(async (tx) => {
        await tx.softDelete(id, context.userId);

        // 5. Audit logging (Golden Rule #2)
        await this.auditAdapter.log({
          action: 'taxonomy.deleted',
          tenant_id: context.tenantId,
          user_id: context.userId,
          resource_type: 'taxonomy',
          resource_id: id,
          old_values: this.extractAuditableFields(taxonomy),
          metadata: {
            correlationId,
            source: 'taxonomy.service',
            action: 'delete',
          },
        });
      });

      // 6. Invalidate caches
      await this.invalidateCaches(context.tenantId, [taxonomy.namespace]);
      await this.cacheAdapter.del(`taxonomy:${id}:${context.tenantId}`);

      this.logger.log('Taxonomy deleted successfully', {
        taxonomyId: id,
        tenantId: context.tenantId,
        correlationId,
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error('Taxonomy deletion failed', {
        taxonomyId: id,
        error: (error as Error).message,
        tenantId: context.tenantId,
        correlationId,
      });

      throw new BadRequestException({
        code: 'TAXONOMY_DELETION_FAILED',
        message: 'Failed to delete taxonomy',
        correlationId,
      });
    }
  }

  /**
   * Get category tree for taxonomy
   */
  async getCategoryTree(
    taxonomyId: string,
    context: RequestContext,
    maxDepth?: number
  ): Promise<any[]> {
    try {
      // Check cache first
      const cacheKey = `taxonomy:tree:${taxonomyId}:${context.tenantId}:${maxDepth || 'all'}`;
      const cached = await this.cacheAdapter.get<any[]>(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Validate taxonomy exists
      const taxonomy = await this.taxonomyRepository.findById(taxonomyId, context.tenantId);
      if (!taxonomy) {
        throw new NotFoundException('Taxonomy not found');
      }

      // Fetch category tree
      const tree = await this.taxonomyRepository.getCategoryTree(
        taxonomyId,
        context.tenantId,
        maxDepth
      );

      // Cache the tree
      await this.cacheAdapter.cacheTaxonomyTree(context.tenantId, taxonomyId, tree);

      return tree;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error('Failed to fetch category tree', {
        taxonomyId,
        error: (error as Error).message,
        tenantId: context.tenantId,
        correlationId: context.correlationId,
      });

      throw new BadRequestException('Failed to fetch category tree');
    }
  }

  /**
   * Clone taxonomy with all categories
   */
  async clone(
    sourceId: string,
    newName: string,
    context: RequestContext,
    namespace?: string
  ): Promise<TaxonomyResponseDto> {
    try {
      // Validate source taxonomy
      const sourceTaxonomy = await this.taxonomyRepository.findById(sourceId, context.tenantId);
      if (!sourceTaxonomy) {
        throw new NotFoundException('Source taxonomy not found');
      }

      // Use AI to generate optimized clone if available (Golden Rule #5)
      const aiSuggestions = await this.generateAICloneSuggestions(sourceTaxonomy, newName);

      // Clone taxonomy with categories
      const clonedTaxonomy = await this.taxonomyRepository.cloneWithCategories(
        sourceId,
        {
          name: newName,
          namespace: namespace || sourceTaxonomy.namespace,
          slug: aiSuggestions?.slug || `${sourceTaxonomy.slug}-copy-${Date.now()}`,
          description: `Cloned from ${sourceTaxonomy.name}`,
        },
        context.tenantId,
        context.userId
      );

      // Audit the clone operation
      await this.auditAdapter.log({
        action: 'taxonomy.cloned',
        tenant_id: context.tenantId,
        user_id: context.userId,
        resource_type: 'taxonomy',
        resource_id: clonedTaxonomy.id,
        metadata: {
          source_taxonomy_id: sourceId,
          correlationId: context.correlationId,
        },
      });

      return this.transformToResponseDto(clonedTaxonomy);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error('Taxonomy clone failed', {
        sourceId,
        error: (error as Error).message,
        tenantId: context.tenantId,
        correlationId: context.correlationId,
      });

      throw new BadRequestException('Failed to clone taxonomy');
    }
  }

  /**
   * Bulk operations on taxonomies
   */
  async bulkOperation(bulkDto: BulkOperationDto, context: RequestContext): Promise<any> {
    try {
      const { operation, taxonomyIds, data } = bulkDto;
      const results = [];

      switch (operation) {
        case 'activate':
          for (const id of taxonomyIds) {
            try {
              const result = await this.update(id, { status: TaxonomyStatus.active }, context);
              results.push({ id, success: true, data: result });
            } catch (error) {
              results.push({ id, success: false, error: (error as Error).message });
            }
          }
          break;

        case 'deactivate':
          for (const id of taxonomyIds) {
            try {
              const result = await this.update(id, { status: TaxonomyStatus.draft }, context);
              results.push({ id, success: true, data: result });
            } catch (error) {
              results.push({ id, success: false, error: (error as Error).message });
            }
          }
          break;

        case 'delete':
          for (const id of taxonomyIds) {
            try {
              await this.remove(id, context);
              results.push({ id, success: true });
            } catch (error) {
              results.push({ id, success: false, error: (error as Error).message });
            }
          }
          break;

        default:
          throw new BadRequestException(`Unsupported operation: ${operation}`);
      }

      // Audit bulk operation
      await this.auditAdapter.logBulkClassification(
        context.tenantId,
        context.userId,
        operation,
        taxonomyIds.length,
        {
          correlationId: context.correlationId,
          results: results.filter(r => r.success).length,
          errors: results.filter(r => !r.success).length,
        }
      );

      return {
        operation,
        total: taxonomyIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      };
    } catch (error) {
      this.logger.error('Bulk operation failed', {
        operation: bulkDto.operation,
        error: (error as Error).message,
        tenantId: context.tenantId,
        correlationId: context.correlationId,
      });

      throw new BadRequestException('Bulk operation failed');
    }
  }

  /**
   * Export taxonomy structure
   */
  async export(
    taxonomyId: string,
    format: 'json' | 'csv' | 'xlsx',
    context: RequestContext
  ): Promise<any> {
    try {
      const taxonomy = await this.taxonomyRepository.findById(taxonomyId, context.tenantId);
      if (!taxonomy) {
        throw new NotFoundException('Taxonomy not found');
      }

      const categories = await this.taxonomyRepository.getCategoryTree(
        taxonomyId,
        context.tenantId
      );

      const exportData = {
        taxonomy: this.transformToResponseDto(taxonomy),
        categories,
        exportedAt: new Date().toISOString(),
        format,
      };

      switch (format) {
        case 'json':
          return exportData;
        
        case 'csv':
          return this.convertToCSV(exportData);
        
        case 'xlsx':
          return await this.convertToExcel(exportData);
        
        default:
          throw new BadRequestException(`Unsupported format: ${format}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error('Export failed', {
        taxonomyId,
        format,
        error: (error as Error).message,
        tenantId: context.tenantId,
        correlationId: context.correlationId,
      });

      throw new BadRequestException('Export failed');
    }
  }

  /**
   * Transform entity to response DTO
   */
  private transformToResponseDto(taxonomy: Taxonomy): TaxonomyResponseDto {
    return {
      id: taxonomy.id,
      tenantId: taxonomy.tenant_id,
      namespace: taxonomy.namespace,
      name: taxonomy.name,
      slug: taxonomy.slug,
      description: taxonomy.description,
      version: taxonomy.version,
      status: taxonomy.status,
      isSystem: taxonomy.is_system,
      isHierarchical: taxonomy.is_hierarchical,
      maxDepth: taxonomy.max_depth,
      metadata: taxonomy.metadata as Record<string, any>,
      createdAt: taxonomy.created_at,
      updatedAt: taxonomy.updated_at,
      createdBy: taxonomy.created_by,
      updatedBy: taxonomy.updated_by,
    };
  }

  /**
   * Validate taxonomy uniqueness
   */
  private async validateUniqueness(
    namespace: string,
    slug: string,
    tenantId: string,
    excludeId?: string
  ): Promise<void> {
    const existing = await this.taxonomyRepository.findByNamespaceAndSlug(
      namespace,
      slug,
      tenantId
    );

    if (existing && existing.id !== excludeId) {
      throw new BadRequestException({
        code: 'TAXONOMY_SLUG_CONFLICT',
        message: `Taxonomy with slug '${slug}' already exists in namespace '${namespace}'`,
      });
    }
  }

  /**
   * Validate namespace quota
   */
  private async validateNamespaceQuota(namespace: string, tenantId: string): Promise<void> {
    // Implementation would check namespace quotas via masterdata service
    // For now, we'll skip this validation
  }

  /**
   * Check if user has admin permissions
   */
  private async hasAdminPermissions(context: RequestContext): Promise<boolean> {
    // Implementation would check admin permissions via auth service
    return true; // Placeholder
  }

  /**
   * Generate AI clone suggestions (Golden Rule #5)
   */
  private async generateAICloneSuggestions(
    sourceTaxonomy: Taxonomy,
    newName: string
  ): Promise<{ slug: string; suggestions: string[] } | null> {
    try {
      const response = await this.apiGatewayAdapter.queryAI(
        `Generate an optimized slug and improvement suggestions for cloning taxonomy "${sourceTaxonomy.name}" to "${newName}". Consider SEO and usability.`,
        {
          source_taxonomy: {
            name: sourceTaxonomy.name,
            slug: sourceTaxonomy.slug,
            namespace: sourceTaxonomy.namespace,
          },
          new_name: newName,
        },
        {
          requiresMCP: false,
          model: 'claude-3-haiku',
          maxTokens: 500,
        }
      );

      if (response.success && response.data) {
        // Parse AI response for structured suggestions
        return this.parseAISuggestions(response.data);
      }
    } catch (error) {
      this.logger.warn('AI suggestions failed, using fallback', error);
    }

    return null;
  }

  /**
   * Parse AI response for clone suggestions
   */
  private parseAISuggestions(aiResponse: string): { slug: string; suggestions: string[] } {
    // Simple parsing logic - in production, this would be more sophisticated
    const lines = aiResponse.split('\n');
    const slug = lines.find(line => line.includes('slug:'))?.split(':')[1]?.trim() || 
                 `copy-${Date.now()}`;
    const suggestions = lines.filter(line => line.startsWith('- ')).map(line => line.substring(2));

    return { slug, suggestions };
  }

  /**
   * Extract auditable fields from object
   */
  private extractAuditableFields(obj: any): Record<string, any> {
    const { id, created_at, updated_at, deleted_at, ...auditable } = obj;
    return auditable;
  }

  /**
   * Invalidate relevant caches
   */
  private async invalidateCaches(tenantId: string, namespaces: string[]): Promise<void> {
    const promises = [
      this.cacheAdapter.clearByPattern(`taxonomies:list:*:${tenantId}`),
      ...namespaces.map(ns => this.cacheAdapter.clearByPattern(`taxonomy:*:${ns}:*`)),
    ];

    await Promise.all(promises);
  }

  /**
   * Convert export data to CSV format
   */
  private convertToCSV(data: any): string {
    // Implementation would convert to CSV format
    return 'CSV export not implemented yet';
  }

  /**
   * Convert export data to Excel format
   */
  private async convertToExcel(data: any): Promise<Buffer> {
    // Implementation would convert to Excel format using a library like xlsx
    throw new BadRequestException('Excel export not implemented yet');
  }
}


