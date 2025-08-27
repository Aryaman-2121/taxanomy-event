/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Taxonomy Data Repository
 * Template: Eventzr Code Repository Template v1.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { Taxonomy, Prisma, TaxonomyStatus } from '@prisma/client';
import { PrismaService } from '../../../common/database/prisma.service';
import { TaxonomyQueryDto } from '../dto/taxonomy-query.dto';
import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';

export interface CreateTaxonomyData {
  tenant_id: string;
  namespace: string;
  name: string;
  slug: string;
  description?: string;
  status?: TaxonomyStatus;
  is_hierarchical?: boolean;
  max_depth?: number;
  metadata?: any;
  created_by: string;
  updated_by: string;
}

export interface UpdateTaxonomyData {
  name?: string;
  slug?: string;
  description?: string;
  status?: TaxonomyStatus;
  version?: number;
  max_depth?: number;
  metadata?: any;
  updated_by: string;
}

@Injectable()
export class TaxonomyRepository {
  private readonly logger = new Logger(TaxonomyRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new taxonomy
   */
  async create(data: CreateTaxonomyData): Promise<Taxonomy> {
    try {
      await this.prisma.setTenantContext(data.tenant_id);

      const taxonomy = await this.prisma.taxonomy.create({
        data: {
          id: undefined, // Let Prisma generate UUID
          tenant_id: data.tenant_id,
          namespace: data.namespace,
          name: data.name,
          slug: data.slug,
          description: data.description,
          status: data.status || TaxonomyStatus.draft,
          is_system: false, // User-created taxonomies are never system taxonomies
          is_hierarchical: data.is_hierarchical ?? true,
          max_depth: data.max_depth || 6,
          metadata: data.metadata || {},
          created_by: data.created_by,
          updated_by: data.updated_by,
        },
      });

      this.logger.log('Taxonomy created', {
        taxonomyId: taxonomy.id,
        namespace: taxonomy.namespace,
        name: taxonomy.name,
        tenantId: data.tenant_id,
      });

      return taxonomy;
    } catch (error) {
      this.logger.error('Failed to create taxonomy', {
        data,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Find taxonomy by ID
   */
  async findById(id: string, tenantId: string): Promise<Taxonomy | null> {
    try {
      await this.prisma.setTenantContext(tenantId);

      const taxonomy = await this.prisma.taxonomy.findFirst({
        where: {
          id: id,
          tenant_id: tenantId,
          deleted_at: null,
        },
      });

      return taxonomy;
    } catch (error) {
      this.logger.error('Failed to find taxonomy by ID', {
        id,
        tenantId,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Find taxonomy by namespace and slug
   */
  async findByNamespaceAndSlug(
    namespace: string,
    slug: string,
    tenantId: string
  ): Promise<Taxonomy | null> {
    try {
      await this.prisma.setTenantContext(tenantId);

      const taxonomy = await this.prisma.taxonomy.findFirst({
        where: {
          tenant_id: tenantId,
          namespace: namespace,
          slug: slug,
          deleted_at: null,
        },
      });

      return taxonomy;
    } catch (error) {
      this.logger.error('Failed to find taxonomy by namespace and slug', {
        namespace,
        slug,
        tenantId,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Find all taxonomies with pagination and filtering
   */
  async findAllPaginated(
    query: TaxonomyQueryDto,
    tenantId: string
  ): Promise<PaginatedResponse<Taxonomy>> {
    try {
      await this.prisma.setTenantContext(tenantId);

      const {
        page = 1,
        limit = 20,
        namespace,
        status,
        search,
        isSystem,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.TaxonomyWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        ...(namespace && { namespace }),
        ...(status && { status }),
        ...(typeof isSystem === 'boolean' && { is_system: isSystem }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      // Execute queries in parallel
      const [items, total] = await Promise.all([
        this.prisma.taxonomy.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
        }),
        this.prisma.taxonomy.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        items,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error('Failed to find paginated taxonomies', {
        query,
        tenantId,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Update taxonomy
   */
  async update(id: string, data: UpdateTaxonomyData, userId: string): Promise<Taxonomy> {
    try {
      const taxonomy = await this.prisma.taxonomy.update({
        where: { id },
        data: {
          ...data,
          updated_by: userId,
          updated_at: new Date(),
          // Increment version if any structural changes
          ...(data.name || data.status || data.max_depth) && {
            version: {
              increment: 1,
            },
          },
        },
      });

      this.logger.log('Taxonomy updated', {
        taxonomyId: id,
        updatedFields: Object.keys(data),
      });

      return taxonomy;
    } catch (error) {
      this.logger.error('Failed to update taxonomy', {
        id,
        data,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Soft delete taxonomy
   */
  async softDelete(id: string, userId: string): Promise<void> {
    try {
      await this.prisma.taxonomy.update({
        where: { id },
        data: {
          deleted_at: new Date(),
          updated_by: userId,
          status: TaxonomyStatus.archived,
        },
      });

      this.logger.log('Taxonomy soft deleted', { taxonomyId: id });
    } catch (error) {
      this.logger.error('Failed to soft delete taxonomy', {
        id,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Count dependent classifications
   */
  async countDependentClassifications(taxonomyId: string): Promise<number> {
    try {
      const count = await this.prisma.classification.count({
        where: {
          taxonomy_id: taxonomyId,
          deleted_at: null,
        },
      });

      return count;
    } catch (error) {
      this.logger.error('Failed to count dependent classifications', {
        taxonomyId,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Get category tree for taxonomy
   */
  async getCategoryTree(
    taxonomyId: string,
    tenantId: string,
    maxDepth?: number
  ): Promise<any[]> {
    try {
      await this.prisma.setTenantContext(tenantId);

      // Use recursive CTE to build hierarchical tree
      const query = `
        WITH RECURSIVE category_tree AS (
          -- Base case: root categories
          SELECT 
            c.id,
            c.taxonomy_id,
            c.parent_id,
            c.name,
            c.slug,
            c.description,
            c.level,
            c.path,
            c.sort_order,
            c.is_leaf,
            c.is_active,
            c.ai_generated,
            c.confidence_score,
            c.usage_count,
            c.metadata,
            c.created_at,
            c.updated_at,
            ARRAY[c.id] as ancestors,
            0 as depth
          FROM categories c
          WHERE c.taxonomy_id = $1::uuid
            AND c.tenant_id = $2::uuid
            AND c.parent_id IS NULL
            AND c.deleted_at IS NULL
            AND c.is_active = true

          UNION ALL

          -- Recursive case: child categories
          SELECT 
            c.id,
            c.taxonomy_id,
            c.parent_id,
            c.name,
            c.slug,
            c.description,
            c.level,
            c.path,
            c.sort_order,
            c.is_leaf,
            c.is_active,
            c.ai_generated,
            c.confidence_score,
            c.usage_count,
            c.metadata,
            c.created_at,
            c.updated_at,
            ct.ancestors || c.id,
            ct.depth + 1
          FROM categories c
          INNER JOIN category_tree ct ON c.parent_id = ct.id
          WHERE c.tenant_id = $2::uuid
            AND c.deleted_at IS NULL
            AND c.is_active = true
            ${maxDepth ? `AND ct.depth < $3` : ''}
        )
        SELECT * FROM category_tree
        ORDER BY level, sort_order, name
      `;

      const params = maxDepth 
        ? [taxonomyId, tenantId, maxDepth]
        : [taxonomyId, tenantId];

      const categories = await this.prisma.$queryRawUnsafe(query, ...params);

      // Transform flat result into hierarchical tree
      return this.buildCategoryTree(categories as any[]);
    } catch (error) {
      this.logger.error('Failed to get category tree', {
        taxonomyId,
        tenantId,
        maxDepth,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Clone taxonomy with all categories
   */
  async cloneWithCategories(
    sourceId: string,
    cloneData: {
      name: string;
      namespace: string;
      slug: string;
      description?: string;
    },
    tenantId: string,
    userId: string
  ): Promise<Taxonomy> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Create new taxonomy
        const clonedTaxonomy = await tx.taxonomy.create({
          data: {
            tenant_id: tenantId,
            namespace: cloneData.namespace,
            name: cloneData.name,
            slug: cloneData.slug,
            description: cloneData.description,
            status: TaxonomyStatus.draft,
            is_system: false,
            is_hierarchical: true,
            max_depth: 6,
            metadata: { cloned_from: sourceId },
            created_by: userId,
            updated_by: userId,
          },
        });

        // 2. Clone all categories
        await this.cloneCategories(tx, sourceId, clonedTaxonomy.id, tenantId, userId);

        return clonedTaxonomy;
      });
    } catch (error) {
      this.logger.error('Failed to clone taxonomy', {
        sourceId,
        cloneData,
        tenantId,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Execute database transaction
   */
  async transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(fn);
  }

  /**
   * Build hierarchical tree from flat category list
   */
  private buildCategoryTree(categories: any[]): any[] {
    const categoryMap = new Map();
    const roots: any[] = [];

    // Create map of categories and initialize children arrays
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Build parent-child relationships
    categories.forEach(category => {
      const node = categoryMap.get(category.id);
      
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * Clone categories recursively
   */
  private async cloneCategories(
    tx: any,
    sourceTaxonomyId: string,
    targetTaxonomyId: string,
    tenantId: string,
    userId: string,
    parentIdMap: Map<string, string> = new Map()
  ): Promise<void> {
    // Get source categories
    const sourceCategories = await tx.category.findMany({
      where: {
        taxonomy_id: sourceTaxonomyId,
        tenant_id: tenantId,
        deleted_at: null,
      },
      orderBy: [
        { level: 'asc' },
        { sort_order: 'asc' },
      ],
    });

    // Clone categories level by level to maintain relationships
    for (const sourceCategory of sourceCategories) {
      const newParentId = sourceCategory.parent_id 
        ? parentIdMap.get(sourceCategory.parent_id) 
        : null;

      const clonedCategory = await tx.category.create({
        data: {
          tenant_id: tenantId,
          taxonomy_id: targetTaxonomyId,
          parent_id: newParentId,
          name: sourceCategory.name,
          slug: sourceCategory.slug,
          description: sourceCategory.description,
          level: sourceCategory.level,
          path: sourceCategory.path,
          sort_order: sourceCategory.sort_order,
          is_leaf: sourceCategory.is_leaf,
          is_active: sourceCategory.is_active,
          ai_generated: sourceCategory.ai_generated,
          confidence_score: sourceCategory.confidence_score,
          usage_count: 0, // Reset usage count for cloned categories
          metadata: {
            ...sourceCategory.metadata,
            cloned_from: sourceCategory.id,
          },
          created_by: userId,
          updated_by: userId,
        },
      });

      // Map old ID to new ID for child references
      parentIdMap.set(sourceCategory.id, clonedCategory.id);
    }
  }
}

