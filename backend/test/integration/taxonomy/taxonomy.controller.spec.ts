/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Taxonomy Controller Integration Tests
 * Template: Eventzr Code Repository Template v1.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/common/database/prisma.service';
import { AuthAdapter } from '../../../src/common/adapters/auth.adapter';
import { TaxonomyStatus } from '@prisma/client';

describe('TaxonomyController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authAdapter: jest.Mocked<AuthAdapter>;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    tenantId: '123e4567-e89b-12d3-a456-426614174001',
    email: 'test@example.com',
    roles: ['admin'],
    permissions: ['taxonomy:read', 'taxonomy:write'],
    scope: ['taxonomy'],
  };

  const mockAuthToken = 'mock.jwt.token';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthAdapter)
      .useValue({
        validateToken: jest.fn(),
        validateTenantAccess: jest.fn(),
        hasPermissions: jest.fn(),
        hasRoles: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    authAdapter = moduleFixture.get(AuthAdapter);

    // Setup auth mocks
    authAdapter.validateToken.mockResolvedValue(mockUser);
    authAdapter.validateTenantAccess.mockResolvedValue(true);
    authAdapter.hasPermissions.mockResolvedValue(true);
    authAdapter.hasRoles.mockResolvedValue(true);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.classification.deleteMany();
    await prisma.category.deleteMany();
    await prisma.taxonomy.deleteMany();
    await prisma.namespace.deleteMany();
  });

  describe('POST /taxonomy', () => {
    const createTaxonomyDto = {
      namespace: 'events',
      name: 'Event Categories',
      slug: 'event-categories',
      description: 'Test taxonomy for events',
      status: TaxonomyStatus.active,
    };

    it('should create taxonomy successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/taxonomy')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('X-Tenant-ID', mockUser.tenantId)
        .send(createTaxonomyDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(createTaxonomyDto.name);
      expect(response.body.data.slug).toBe(createTaxonomyDto.slug);
      expect(response.body.data.status).toBe(createTaxonomyDto.status);
      expect(response.body.data.tenantId).toBe(mockUser.tenantId);
    });

    it('should return 400 for invalid data', async () => {
      const invalidDto = {
        ...createTaxonomyDto,
        name: '', // Invalid: empty name
        slug: 'INVALID_SLUG', // Invalid: uppercase slug
      };

      const response = await request(app.getHttpServer())
        .post('/taxonomy')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('X-Tenant-ID', mockUser.tenantId)
        .send(invalidDto)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
      expect(response.body.error.details).toBeDefined();
    });

    it('should return 401 without authentication token', async () => {
      await request(app.getHttpServer())
        .post('/taxonomy')
        .send(createTaxonomyDto)
        .expect(401);
    });

    it('should return 409 for duplicate slug in namespace', async () => {
      // Create first taxonomy
      await request(app.getHttpServer())
        .post('/taxonomy')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('X-Tenant-ID', mockUser.tenantId)
        .send(createTaxonomyDto)
        .expect(201);

      // Try to create duplicate
      const response = await request(app.getHttpServer())
        .post('/taxonomy')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('X-Tenant-ID', mockUser.tenantId)
        .send(createTaxonomyDto)
        .expect(400);

      expect(response.body.error.code).toBe('TAXONOMY_SLUG_CONFLICT');
    });
  });

  describe('GET /taxonomy', () => {
    beforeEach(async () => {
      // Create test taxonomies
      await prisma.taxonomy.createMany({
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174010',
            tenant_id: mockUser.tenantId,
            namespace: 'events',
            name: 'Event Categories',
            slug: 'event-categories',
            description: 'Event taxonomy',
            status: TaxonomyStatus.active,
            is_hierarchical: true,
            max_depth: 6,
            metadata: {},
            created_by: mockUser.id,
            updated_by: mockUser.id,
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174011',
            tenant_id: mockUser.tenantId,
            namespace: 'venues',
            name: 'Venue Categories',
            slug: 'venue-categories',
            description: 'Venue taxonomy',
            status: TaxonomyStatus.draft,
            is_hierarchical: true,
            max_depth: 4,
            metadata: {},
            created_by: mockUser.id,
            updated_by: mockUser.id,
          },
        ],
      });
    });

    it('should return paginated taxonomies', async () => {
      const response = await request(app.getHttpServer())
        .get('/taxonomy?page=1&limit=10')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('X-Tenant-ID', mockUser.tenantId)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.metadata.pagination.total).toBe(2);
      expect(response.body.metadata.pagination.page).toBe(1);
      expect(response.body.metadata.pagination.limit).toBe(10);
    });

    it('should filter by namespace', async () => {
      const response = await request(app.getHttpServer())
        .get('/taxonomy?namespace=events')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('X-Tenant-ID', mockUser.tenantId)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].namespace).toBe('events');
    });

    it('should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/taxonomy?status=${TaxonomyStatus.active}`)
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('X-Tenant-ID', mockUser.tenantId)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe(TaxonomyStatus.active);
    });

    it('should search taxonomies', async () => {
      const response = await request(app.getHttpServer())
        .get('/taxonomy?search=event')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('X-Tenant-ID', mockUser.tenantId)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toContain('Event');
    });

    it('should sort taxonomies', async () => {
      const response = await request(app.getHttpServer())
        .get('/taxonomy?sortBy=name&sortOrder=asc')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('X-Tenant-ID', mockUser.tenantId)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Event Categories');
      expect(response.body.data[1].name).toBe('Venue Categories');
    });
  });

  describe('GET /taxonomy/:id', () => {
    let taxonomyId: string;

    beforeEach(async () => {
      const taxonomy = await prisma.taxonomy.create({
        data: {
          id: '123e4567-e89b-12d3-a456-426614174010',
          tenant_id: mockUser.tenantId,
          namespace: 'events',
          name: 'Event Categories',
          slug: 'event-categories',
          description: 'Event taxonomy',
          status: TaxonomyStatus.active,
          is_hierarchical: true,
          max_depth: 6,
          metadata: { test: true },
          created_by: mockUser.id,
          updated_by: mockUser.id,
        },
      });
      taxonomyId = taxonomy.id;
    });

    it('should return single taxonomy', async () => {
      const response = await request(app.getHttpServer())
        .get(`/taxonomy/${taxonomyId}`)
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('X-Tenant-ID', mockUser.tenantId)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(taxonomyId);
      expect(response.body.data.name).toBe('Event Categories');
      expect(response.body.data.metadata.test).toBe(true);
    });

    it('should return 404 for non-existent taxonomy', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      const response = await request(app.getHttpServer())
        .get(`/taxonomy/${nonExistentId}`)
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('X-Tenant-ID', mockUser.tenantId)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TAXONOMY_NOT_FOUND');
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .get('/taxonomy/invalid-id')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('X-Tenant-ID', mockUser.tenantId)
        .expect(400);
    });
  });

  describe('PUT /taxonomy/:id', () => {
    let taxonomyId: string;

    beforeEach(async () => {
      const taxonomy = await prisma.taxonomy.create({
        data: {
          id: '123e4567-e89b-12d3-a456-426614174010',
          tenant_id: mockUser.tenantId,
          namespace: 'events',
          name: 'Event Categories',
          slug: 'event-categories',
          description: 'Event taxonomy',
          status: TaxonomyStatus.draft,
          is_hierarchical: true,
          max_depth: 6,
          metadata: {},
          created_by: mockUser.id,
          updated_by: mockUser.id,
        },
      });
      taxonomyId = taxonomy.id;
    });

    it('should update taxonomy successfully', async () => {
      const updateDto = {
        name: 'Updated Event Categories',
        description: 'Updated description',
        status: TaxonomyStatus.active,
      };

      const response = await request(app.getHttpServer())
        .put(`/taxonomy/${taxonomyId}`)
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('X-Tenant-ID', mockUser.tenantId)
        .send(updateDto)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateDto.name);
      expect(response.body.data.description).toBe(updateDto.description);
      expect(response.body.data.status).toBe(updateDto.status);
      expect(response.body.data.version).toBeGreaterThan(1);
    });

    it('should return 404 for non-existent taxonomy', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      const response = await request(app.getHttpServer())
        .put(`/taxonomy/${nonExistentId}`)
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('X-Tenant-ID', mockUser.tenantId)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.error.code).toBe('TAXONOMY_NOT_FOUND');
    });
  });

  describe('DELETE /taxonomy/:id', () => {
    let taxonomyId: string;

    beforeEach(async () => {
      const taxonomy = await prisma.taxonomy.create({
        data: {
          id: '123e4567-e89b-12d3-a456-426614174010',
          tenant_id: mockUser.tenantId,
          namespace: 'events',
          name: 'Event Categories',
          slug: 'event-categories',
          description: 'Event taxonomy',
          status: TaxonomyStatus.draft,
          is_hierarchical: true,
          max_depth: 6,
          metadata: {},
          created_by: mockUser.id,
          updated_by: mockUser.id,
        },
      });
      taxonomyId = taxonomy.id;
    });

    it('should delete taxonomy successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/taxonomy/${taxonomyId}`)
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('X-Tenant-ID', mockUser.tenantId)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeNull();

      // Verify taxonomy is soft deleted
      const deletedTaxonomy = await prisma.taxonomy.findUnique({
        where: { id: taxonomyId },
      });
      expect(deletedTaxonomy.deleted_at).not.toBeNull();
      expect(deletedTaxonomy.status).toBe(TaxonomyStatus.archived);
    });

    it('should return 404 for non-existent taxonomy', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      const response = await request(app.getHttpServer())
        .delete(`/taxonomy/${nonExistentId}`)
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('X-Tenant-ID', mockUser.tenantId)
        .expect(404);

      expect(response.body.error.code).toBe('TAXONOMY_NOT_FOUND');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const createDto = {
        namespace: 'test',
        name: 'Test Taxonomy',
        slug: 'test-taxonomy',
      };

      // Make requests up to the limit
      for (let i = 0; i < 100; i++) {
        await request(app.getHttpServer())
          .post('/taxonomy')
          .set('Authorization', `Bearer ${mockAuthToken}`)
          .set('X-Tenant-ID', mockUser.tenantId)
          .send({
            ...createDto,
            slug: `test-taxonomy-${i}`,
          })
          .expect(201);
      }

      // Next request should be rate limited
      await request(app.getHttpServer())
        .post('/taxonomy')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('X-Tenant-ID', mockUser.tenantId)
        .send({
          ...createDto,
          slug: 'test-taxonomy-overflow',
        })
        .expect(429);
    }, 30000); // Increase timeout for this test
  });
});

# PART E: CONFIGURATION, DOCKER, AND DEPLOYMENT FILES

