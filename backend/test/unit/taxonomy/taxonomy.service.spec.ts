/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Taxonomy Service Unit Tests
 * Template: Eventzr Code Repository Template v1.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { TaxonomyService } from '../../../src/modules/taxonomy/services/taxonomy.service';
import { TaxonomyRepository } from '../../../src/modules/taxonomy/repositories/taxonomy.repository';
import { AuthAdapter } from '../../../src/common/adapters/auth.adapter';
import { AuditAdapter } from '../../../src/common/adapters/audit.adapter';
import { CacheAdapter } from '../../../src/common/adapters/cache.adapter';
import { ApiGatewayAdapter } from '../../../src/common/adapters/api-gateway.adapter';
import { TaxonomyStatus } from '@prisma/client';
import { CreateTaxonomyDto } from '../../../src/modules/taxonomy/dto/create-taxonomy.dto';
import { RequestContext } from '../../../src/common/interfaces/request-context.interface';

describe('TaxonomyService', () => {
  let service: TaxonomyService;
  let repository: jest.Mocked<TaxonomyRepository>;
  let authAdapter: jest.Mocked<AuthAdapter>;
  let auditAdapter: jest.Mocked<AuditAdapter>;
  let cacheAdapter: jest.Mocked<CacheAdapter>;
  let apiGatewayAdapter: jest.Mocked<ApiGatewayAdapter>;

  const mockTaxonomy = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    tenant_id: '123e4567-e89b-12d3-a456-426614174001',
    namespace: 'events',
    name: 'Event Categories',
    slug: 'event-categories',
    description: 'Test taxonomy',
    version: 1,
    status: TaxonomyStatus.active,
    is_system: false,
    is_hierarchical: true,
    max_depth: 6,
    metadata: {},
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    created_by: '123e4567-e89b-12d3-a456-426614174002',
    updated_by: '123e4567-e89b-12d3-a456-426614174002',
  };

  const mockRequestContext: RequestContext = {
    userId: '123e4567-e89b-12d3-a456-426614174002',
    tenantId: '123e4567-e89b-12d3-a456-426614174001',
    correlationId: 'test-correlation-id',
    timestamp: new Date(),
    userAgent: 'test-agent',
    ipAddress: '127.0.0.1',
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByNamespaceAndSlug: jest.fn(),
      findAllPaginated: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      countDependentClassifications: jest.fn(),
      getCategoryTree: jest.fn(),
      cloneWithCategories: jest.fn(),
      transaction: jest.fn(),
    };

    const mockAuthAdapter = {
      validateTenantAccess: jest.fn(),
      hasPermissions: jest.fn(),
      hasRoles: jest.fn(),
    };

    const mockAuditAdapter = {
      log: jest.fn(),
      logTaxonomyCreated: jest.fn(),
      logTaxonomyUpdated: jest.fn(),
      logBulkClassification: jest.fn(),
    };

    const mockCacheAdapter = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      clearByPattern: jest.fn(),
      cacheTaxonomyTree: jest.fn(),
      getTaxonomyTree: jest.fn(),
    };

    const mockApiGatewayAdapter = {
      queryAI: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxonomyService,
        { provide: TaxonomyRepository, useValue: mockRepository },
        { provide: AuthAdapter, useValue: mockAuthAdapter },
        { provide: AuditAdapter, useValue: mockAuditAdapter },
        { provide: CacheAdapter, useValue: mockCacheAdapter },
        { provide: ApiGatewayAdapter, useValue: mockApiGatewayAdapter },
      ],
    })
      .setLogger(new Logger())
      .compile();

    service = module.get<TaxonomyService>(TaxonomyService);
    repository = module.get(TaxonomyRepository);
    authAdapter = module.get(AuthAdapter);
    auditAdapter = module.get(AuditAdapter);
    cacheAdapter = module.get(CacheAdapter);
    apiGatewayAdapter = module.get(ApiGatewayAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createTaxonomyDto: CreateTaxonomyDto = {
      namespace: 'events',
      name: 'Event Categories',
      slug: 'event-categories',
      description: 'Test taxonomy',
      status: TaxonomyStatus.active,
    };

    it('should create taxonomy successfully', async () => {
      // Arrange
      authAdapter.validateTenantAccess.mockResolvedValue(true);
      repository.findByNamespaceAndSlug.mockResolvedValue(null);
      repository.transaction.mockImplementation(async (callback) => {
        const mockTx = {
          create: jest.fn().mockResolvedValue(mockTaxonomy),
        };
        return callback(mockTx);
      });
      auditAdapter.logTaxonomyCreated.mockResolvedValue(undefined);
      cacheAdapter.clearByPattern.mockResolvedValue(undefined);

      // Act
      const result = await service.create(createTaxonomyDto, mockRequestContext);

      // Assert
      expect(authAdapter.validateTenantAccess).toHaveBeenCalledWith(
        mockRequestContext.tenantId,
        mockRequestContext.userId,
      );
      expect(repository.findByNamespaceAndSlug).toHaveBeenCalledWith(
        'events',
        'event-categories',
        mockRequestContext.tenantId,
      );
      expect(repository.transaction).toHaveBeenCalled();
      expect(auditAdapter.logTaxonomyCreated).toHaveBeenCalledWith(
        mockRequestContext.tenantId,
        mockRequestContext.userId,
        mockTaxonomy,
        expect.any(Object),
      );
      expect(result.id).toBe(mockTaxonomy.id);
      expect(result.name).toBe(mockTaxonomy.name);
    });

    it('should throw error when slug already exists', async () => {
      // Arrange
      authAdapter.validateTenantAccess.mockResolvedValue(true);
      repository.findByNamespaceAndSlug.mockResolvedValue(mockTaxonomy);

      // Act & Assert
      await expect(service.create(createTaxonomyDto, mockRequestContext))
        .rejects.toThrow();

      expect(repository.transaction).not.toHaveBeenCalled();
    });

    it('should throw error when tenant access is denied', async () => {
      // Arrange
      authAdapter.validateTenantAccess.mockRejectedValue(new Error('Access denied'));

      // Act & Assert
      await expect(service.create(createTaxonomyDto, mockRequestContext))
        .rejects.toThrow();

      expect(repository.findByNamespaceAndSlug).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return taxonomy from cache if available', async () => {
      // Arrange
      const cachedTaxonomy = {
        id: mockTaxonomy.id,
        name: mockTaxonomy.name,
        // ... other fields transformed to response DTO
      };
      cacheAdapter.get.mockResolvedValue(cachedTaxonomy);

      // Act
      const result = await service.findOne(mockTaxonomy.id, mockRequestContext);

      // Assert
      expect(cacheAdapter.get).toHaveBeenCalledWith(
        `taxonomy:${mockTaxonomy.id}:${mockRequestContext.tenantId}`
      );
      expect(repository.findById).not.toHaveBeenCalled();
      expect(result).toBe(cachedTaxonomy);
    });

    it('should fetch from database and cache when not in cache', async () => {
      // Arrange
      cacheAdapter.get.mockResolvedValue(null);
      repository.findById.mockResolvedValue(mockTaxonomy);
      cacheAdapter.set.mockResolvedValue(undefined);

      // Act
      const result = await service.findOne(mockTaxonomy.id, mockRequestContext);

      // Assert
      expect(cacheAdapter.get).toHaveBeenCalled();
      expect(repository.findById).toHaveBeenCalledWith(
        mockTaxonomy.id,
        mockRequestContext.tenantId,
      );
      expect(cacheAdapter.set).toHaveBeenCalled();
      expect(result.id).toBe(mockTaxonomy.id);
    });

    it('should throw NotFoundException when taxonomy not found', async () => {
      // Arrange
      cacheAdapter.get.mockResolvedValue(null);
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(mockTaxonomy.id, mockRequestContext))
        .rejects.toThrow();

      expect(cacheAdapter.set).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Event Categories',
      description: 'Updated description',
    };

    it('should update taxonomy successfully', async () => {
      // Arrange
      repository.findById.mockResolvedValue(mockTaxonomy);
      repository.transaction.mockImplementation(async (callback) => {
        const mockTx = {
          update: jest.fn().mockResolvedValue({
            ...mockTaxonomy,
            ...updateDto,
          }),
        };
        return callback(mockTx);
      });
      auditAdapter.logTaxonomyUpdated.mockResolvedValue(undefined);
      cacheAdapter.clearByPattern.mockResolvedValue(undefined);
      cacheAdapter.del.mockResolvedValue(undefined);

      // Act
      const result = await service.update(mockTaxonomy.id, updateDto, mockRequestContext);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(
        mockTaxonomy.id,
        mockRequestContext.tenantId,
      );
      expect(repository.transaction).toHaveBeenCalled();
      expect(auditAdapter.logTaxonomyUpdated).toHaveBeenCalled();
      expect(result.name).toBe(updateDto.name);
    });

    it('should throw error when trying to modify system taxonomy', async () => {
      // Arrange
      const systemTaxonomy = { ...mockTaxonomy, is_system: true };
      repository.findById.mockResolvedValue(systemTaxonomy);

      // Act & Assert
      await expect(service.update(mockTaxonomy.id, updateDto, mockRequestContext))
        .rejects.toThrow();

      expect(repository.transaction).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete taxonomy successfully', async () => {
      // Arrange
      repository.findById.mockResolvedValue(mockTaxonomy);
      repository.countDependentClassifications.mockResolvedValue(0);
      repository.transaction.mockImplementation(async (callback) => {
        const mockTx = {
          softDelete: jest.fn().mockResolvedValue(undefined),
        };
        return callback(mockTx);
      });
      auditAdapter.log.mockResolvedValue(undefined);
      cacheAdapter.clearByPattern.mockResolvedValue(undefined);
      cacheAdapter.del.mockResolvedValue(undefined);

      // Act
      await service.remove(mockTaxonomy.id, mockRequestContext);

      // Assert
      expect(repository.findById).toHaveBeenCalled();
      expect(repository.countDependentClassifications).toHaveBeenCalled();
      expect(repository.transaction).toHaveBeenCalled();
      expect(auditAdapter.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'taxonomy.deleted',
          resource_id: mockTaxonomy.id,
        })
      );
    });

    it('should throw error when taxonomy has dependent classifications', async () => {
      // Arrange
      repository.findById.mockResolvedValue(mockTaxonomy);
      repository.countDependentClassifications.mockResolvedValue(5);

      // Act & Assert
      await expect(service.remove(mockTaxonomy.id, mockRequestContext))
        .rejects.toThrow();

      expect(repository.transaction).not.toHaveBeenCalled();
    });

    it('should throw error when trying to delete system taxonomy', async () => {
      // Arrange
      const systemTaxonomy = { ...mockTaxonomy, is_system: true };
      repository.findById.mockResolvedValue(systemTaxonomy);

      // Act & Assert
      await expect(service.remove(mockTaxonomy.id, mockRequestContext))
        .rejects.toThrow();

      expect(repository.countDependentClassifications).not.toHaveBeenCalled();
    });
  });

  describe('getCategoryTree', () => {
    const mockCategoryTree = [
      {
        id: 'cat1',
        name: 'Music',
        children: [
          { id: 'cat2', name: 'Rock', children: [] },
          { id: 'cat3', name: 'Jazz', children: [] },
        ],
      },
    ];

    it('should return category tree from cache if available', async () => {
      // Arrange
      cacheAdapter.get.mockResolvedValue(mockCategoryTree);

      // Act
      const result = await service.getCategoryTree(mockTaxonomy.id, mockRequestContext);

      // Assert
      expect(cacheAdapter.get).toHaveBeenCalled();
      expect(repository.findById).not.toHaveBeenCalled();
      expect(result).toBe(mockCategoryTree);
    });

    it('should fetch from database and cache when not in cache', async () => {
      // Arrange
      cacheAdapter.get.mockResolvedValue(null);
      repository.findById.mockResolvedValue(mockTaxonomy);
      repository.getCategoryTree.mockResolvedValue(mockCategoryTree);
      cacheAdapter.cacheTaxonomyTree.mockResolvedValue(undefined);

      // Act
      const result = await service.getCategoryTree(mockTaxonomy.id, mockRequestContext);

      // Assert
      expect(repository.findById).toHaveBeenCalled();
      expect(repository.getCategoryTree).toHaveBeenCalledWith(
        mockTaxonomy.id,
        mockRequestContext.tenantId,
        undefined,
      );
      expect(cacheAdapter.cacheTaxonomyTree).toHaveBeenCalled();
      expect(result).toBe(mockCategoryTree);
    });
  });

  describe('clone', () => {
    it('should clone taxonomy with AI suggestions', async () => {
      // Arrange
      const newName = 'Cloned Event Categories';
      const clonedTaxonomy = {
        ...mockTaxonomy,
        id: 'new-id',
        name: newName,
      };

      repository.findById.mockResolvedValue(mockTaxonomy);
      apiGatewayAdapter.queryAI.mockResolvedValue({
        success: true,
        data: 'slug: cloned-event-categories\n- Improved categorization',
      });
      repository.cloneWithCategories.mockResolvedValue(clonedTaxonomy);
      auditAdapter.log.mockResolvedValue(undefined);

      // Act
      const result = await service.clone(
        mockTaxonomy.id,
        newName,
        mockRequestContext,
      );

      // Assert
      expect(repository.findById).toHaveBeenCalled();
      expect(apiGatewayAdapter.queryAI).toHaveBeenCalled();
      expect(repository.cloneWithCategories).toHaveBeenCalled();
      expect(auditAdapter.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'taxonomy.cloned',
          resource_id: clonedTaxonomy.id,
        })
      );
      expect(result.id).toBe(clonedTaxonomy.id);
      expect(result.name).toBe(newName);
    });

    it('should clone taxonomy even if AI suggestions fail', async () => {
      // Arrange
      const newName = 'Cloned Event Categories';
      const clonedTaxonomy = {
        ...mockTaxonomy,
        id: 'new-id',
        name: newName,
      };

      repository.findById.mockResolvedValue(mockTaxonomy);
      apiGatewayAdapter.queryAI.mockRejectedValue(new Error('AI service unavailable'));
      repository.cloneWithCategories.mockResolvedValue(clonedTaxonomy);
      auditAdapter.log.mockResolvedValue(undefined);

      // Act
      const result = await service.clone(
        mockTaxonomy.id,
        newName,
        mockRequestContext,
      );

      // Assert
      expect(repository.findById).toHaveBeenCalled();
      expect(repository.cloneWithCategories).toHaveBeenCalledWith(
        mockTaxonomy.id,
        expect.objectContaining({
          name: newName,
          slug: expect.stringContaining('copy'),
        }),
        mockRequestContext.tenantId,
        mockRequestContext.userId,
      );
      expect(result.id).toBe(clonedTaxonomy.id);
    });
  });
});
