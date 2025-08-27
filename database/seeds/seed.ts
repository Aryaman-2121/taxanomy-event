/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Seed Script: Sample data for development and testing
 * Template: Eventzr Code Repository Template v1.0
 */

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Sample tenant IDs for testing
const SAMPLE_TENANTS = {
  default: 'aaaaaaaa-bbbb-cccc-dddd-000000000001',
  enterprise: 'aaaaaaaa-bbbb-cccc-dddd-000000000002',
  startup: 'aaaaaaaa-bbbb-cccc-dddd-000000000003',
};

// Sample user IDs for audit trails
const SAMPLE_USERS = {
  admin: 'bbbbbbbb-cccc-dddd-eeee-000000000001',
  system: 'bbbbbbbb-cccc-dddd-eeee-000000000002',
  user: 'bbbbbbbb-cccc-dddd-eeee-000000000003',
};

interface SeedTaxonomy {
  namespace: string;
  name: string;
  slug: string;
  description: string;
  is_system: boolean;
  is_hierarchical: boolean;
  max_depth: number;
  categories: SeedCategory[];
}

interface SeedCategory {
  name: string;
  slug: string;
  description: string;
  children?: SeedCategory[];
  ai_generated?: boolean;
  confidence_score?: number;
}

const SEED_TAXONOMIES: SeedTaxonomy[] = [
  {
    namespace: 'events',
    name: 'Event Categories',
    slug: 'event-categories',
    description: 'Comprehensive categorization system for all types of events',
    is_system: true,
    is_hierarchical: true,
    max_depth: 4,
    categories: [
      {
        name: 'Music Events',
        slug: 'music-events',
        description: 'Music-focused events and performances',
        children: [
          {
            name: 'Concerts',
            slug: 'concerts',
            description: 'Live music concerts',
            children: [
              {
                name: 'Rock Concerts',
                slug: 'rock-concerts',
                description: 'Rock and alternative music concerts',
              },
              {
                name: 'Classical Concerts',
                slug: 'classical-concerts',
                description: 'Classical music performances',
              },
            ],
          },
          {
            name: 'Festivals',
            slug: 'music-festivals',
            description: 'Music festivals and multi-day events',
            children: [
              {
                name: 'Electronic Music Festivals',
                slug: 'electronic-festivals',
                description: 'EDM and electronic music festivals',
              },
              {
                name: 'Folk Festivals',
                slug: 'folk-festivals',
                description: 'Traditional and folk music festivals',
              },
            ],
          },
        ],
      },
      {
        name: 'Business Events',
        slug: 'business-events',
        description: 'Professional and business networking events',
        children: [
          {
            name: 'Conferences',
            slug: 'conferences',
            description: 'Professional conferences and summits',
          },
          {
            name: 'Trade Shows',
            slug: 'trade-shows',
            description: 'Industry trade shows and exhibitions',
          },
          {
            name: 'Networking Events',
            slug: 'networking-events',
            description: 'Business networking and meetup events',
          },
        ],
      },
      {
        name: 'Sports Events',
        slug: 'sports-events',
        description: 'Athletic competitions and sports events',
        children: [
          {
            name: 'Team Sports',
            slug: 'team-sports',
            description: 'Team-based sports competitions',
          },
          {
            name: 'Individual Sports',
            slug: 'individual-sports',
            description: 'Individual athletic competitions',
          },
          {
            name: 'Adventure Sports',
            slug: 'adventure-sports',
            description: 'Extreme and adventure sports events',
            ai_generated: true,
            confidence_score: 0.85,
          },
        ],
      },
    ],
  },
  {
    namespace: 'venues',
    name: 'Venue Types',
    slug: 'venue-types',
    description: 'Classification system for event venues and spaces',
    is_system: true,
    is_hierarchical: true,
    max_depth: 3,
    categories: [
      {
        name: 'Indoor Venues',
        slug: 'indoor-venues',
        description: 'Enclosed venue spaces',
        children: [
          {
            name: 'Convention Centers',
            slug: 'convention-centers',
            description: 'Large-scale convention and exhibition centers',
          },
          {
            name: 'Hotels & Resorts',
            slug: 'hotels-resorts',
            description: 'Hotel banquet halls and resort venues',
            children: [
              {
                name: 'Luxury Hotels',
                slug: 'luxury-hotels',
                description: '5-star luxury hotel venues',
              },
              {
                name: 'Budget Hotels',
                slug: 'budget-hotels',
                description: 'Affordable hotel meeting spaces',
              },
            ],
          },
          {
            name: 'Theaters & Auditoriums',
            slug: 'theaters-auditoriums',
            description: 'Performance venues with fixed seating',
          },
        ],
      },
      {
        name: 'Outdoor Venues',
        slug: 'outdoor-venues',
        description: 'Open-air and outdoor event spaces',
        children: [
          {
            name: 'Parks & Gardens',
            slug: 'parks-gardens',
            description: 'Public and private garden spaces',
          },
          {
            name: 'Beaches & Waterfronts',
            slug: 'beaches-waterfronts',
            description: 'Coastal and waterside venues',
          },
          {
            name: 'Sports Complexes',
            slug: 'outdoor-sports-complexes',
            description: 'Outdoor athletic facilities',
          },
        ],
      },
      {
        name: 'Unique Venues',
        slug: 'unique-venues',
        description: 'Unconventional and special event spaces',
        children: [
          {
            name: 'Historic Properties',
            slug: 'historic-properties',
            description: 'Heritage buildings and historic sites',
          },
          {
            name: 'Industrial Spaces',
            slug: 'industrial-spaces',
            description: 'Warehouses and industrial venues',
            ai_generated: true,
            confidence_score: 0.78,
          },
        ],
      },
    ],
  },
  {
    namespace: 'content',
    name: 'Content Categories',
    slug: 'content-categories',
    description: 'Content classification for digital assets and media',
    is_system: false,
    is_hierarchical: true,
    max_depth: 3,
    categories: [
      {
        name: 'Marketing Materials',
        slug: 'marketing-materials',
        description: 'Promotional and marketing content',
        children: [
          {
            name: 'Social Media Content',
            slug: 'social-media-content',
            description: 'Content optimized for social platforms',
          },
          {
            name: 'Email Campaigns',
            slug: 'email-campaigns',
            description: 'Email marketing materials',
          },
          {
            name: 'Print Materials',
            slug: 'print-materials',
            description: 'Brochures, flyers, and print collateral',
          },
        ],
      },
      {
        name: 'Event Documentation',
        slug: 'event-documentation',
        description: 'Event-related documents and materials',
        children: [
          {
            name: 'Contracts & Agreements',
            slug: 'contracts-agreements',
            description: 'Legal documents and contracts',
          },
          {
            name: 'Event Plans',
            slug: 'event-plans',
            description: 'Event planning and logistics documents',
          },
        ],
      },
    ],
  },
];

async function createTaxonomyHierarchy(
  tenantId: string,
  taxonomy: any,
  categories: SeedCategory[],
  parentId: string | null = null,
  level: number = 0
): Promise<void> {
  for (const category of categories) {
    const categoryData = {
      id: uuidv4(),
      tenant_id: tenantId,
      taxonomy_id: taxonomy.id,
      parent_id: parentId,
      name: category.name,
      slug: category.slug,
      description: category.description,
      level: level,
      path: parentId 
        ? `${parentId ? await getCategoryPath(parentId) : ''}/${category.slug}` 
        : `/${category.slug}`,
      sort_order: 0,
      is_leaf: !category.children || category.children.length === 0,
      is_active: true,
      ai_generated: category.ai_generated || false,
      confidence_score: category.confidence_score || null,
      usage_count: Math.floor(Math.random() * 100), // Random usage for demo
      metadata: {
        example: true,
        seed_data: true,
      },
      created_by: SAMPLE_USERS.system,
      updated_by: SAMPLE_USERS.system,
    };

    const createdCategory = await prisma.category.create({
      data: categoryData,
    });

    console.log(`  📂 Created category: ${category.name} (Level ${level})`);

    // Create child categories recursively
    if (category.children && category.children.length > 0) {
      await createTaxonomyHierarchy(
        tenantId,
        taxonomy,
        category.children,
        createdCategory.id,
        level + 1
      );
    }
  }
}

async function getCategoryPath(categoryId: string): Promise<string> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  return category?.path || '';
}

async function seedNamespaces(): Promise<void> {
  console.log('🏷️  Seeding namespaces...');

  const namespaces = [
    {
      tenant_id: SAMPLE_TENANTS.default,
      name: 'Event Categories',
      slug: 'events',
      description: 'Primary event categorization namespace',
      type: 'system',
      is_system: true,
      is_active: true,
      quota_limit: null,
      quota_used: 0,
    },
    {
      tenant_id: SAMPLE_TENANTS.default,
      name: 'Venue Types',
      slug: 'venues',
      description: 'Venue classification namespace',
      type: 'system',
      is_system: true,
      is_active: true,
      quota_limit: null,
      quota_used: 0,
    },
    {
      tenant_id: SAMPLE_TENANTS.enterprise,
      name: 'Custom Categories',
      slug: 'custom',
      description: 'Enterprise custom taxonomy namespace',
      type: 'custom',
      is_system: false,
      is_active: true,
      quota_limit: 1000,
      quota_used: 0,
    },
  ];

  for (const namespace of namespaces) {
    await prisma.namespace.create({
      data: {
        ...namespace,
        id: uuidv4(),
        created_by: SAMPLE_USERS.system,
        updated_by: SAMPLE_USERS.system,
        metadata: { seed_data: true },
      },
    });
    console.log(`  🏷️  Created namespace: ${namespace.name}`);
  }
}

async function seedTaxonomies(): Promise<void> {
  console.log('📊 Seeding taxonomies and categories...');

  for (const tenant of Object.values(SAMPLE_TENANTS)) {
    console.log(`\n🏢 Processing tenant: ${tenant}`);

    for (const taxonomySpec of SEED_TAXONOMIES) {
      const taxonomy = await prisma.taxonomy.create({
        data: {
          id: uuidv4(),
          tenant_id: tenant,
          namespace: taxonomySpec.namespace,
          name: taxonomySpec.name,
          slug: taxonomySpec.slug,
          description: taxonomySpec.description,
          version: 1,
          status: 'active',
          is_system: taxonomySpec.is_system,
          is_hierarchical: taxonomySpec.is_hierarchical,
          max_depth: taxonomySpec.max_depth,
          metadata: {
            seed_data: true,
            total_categories: countCategories(taxonomySpec.categories),
          },
          created_by: SAMPLE_USERS.system,
          updated_by: SAMPLE_USERS.system,
        },
      });

      console.log(`📊 Created taxonomy: ${taxonomySpec.name}`);

      // Create category hierarchy
      await createTaxonomyHierarchy(tenant, taxonomy, taxonomySpec.categories);
    }
  }
}

function countCategories(categories: SeedCategory[]): number {
  let count = categories.length;
  for (const category of categories) {
    if (category.children) {
      count += countCategories(category.children);
    }
  }
  return count;
}

async function seedClassifications(): Promise<void> {
  console.log('🏷️  Seeding sample classifications...');

  // Get some categories to create sample classifications
  const categories = await prisma.category.findMany({
    take: 10,
    where: {
      tenant_id: SAMPLE_TENANTS.default,
    },
    include: {
      taxonomy: true,
    },
  });

  // Create sample entity classifications
  const entityTypes = ['event', 'venue', 'user', 'content'];
  const assignmentMethods = ['user', 'ai', 'system', 'import'];
  const statuses = ['confirmed', 'pending', 'rejected'];

  for (let i = 0; i < 50; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
    const assignedBy = assignmentMethods[Math.floor(Math.random() * assignmentMethods.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    await prisma.classification.create({
      data: {
        id: uuidv4(),
        tenant_id: SAMPLE_TENANTS.default,
        entity_type: entityType,
        entity_id: uuidv4(), // Random entity ID for demo
        taxonomy_id: category.taxonomy_id,
        category_id: category.id,
        confidence_score: Math.random(),
        assigned_by: assignedBy as any,
        status: status as any,
        expires_at: Math.random() > 0.8 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null, // 30 days from now, 20% chance
        metadata: {
          seed_data: true,
          demo_classification: true,
        },
        created_by: SAMPLE_USERS.system,
        updated_by: SAMPLE_USERS.system,
      },
    });
  }

  console.log('  🏷️  Created 50 sample classifications');
}

async function seedTags(): Promise<void> {
  console.log('🏷️  Seeding tags...');

  const categories = await prisma.category.findMany({
    take: 5,
    where: {
      tenant_id: SAMPLE_TENANTS.default,
    },
  });

  const sampleTags = [
    { name: 'Popular', slug: 'popular', color: '#FF6B6B' },
    { name: 'Featured', slug: 'featured', color: '#4ECDC4' },
    { name: 'New', slug: 'new', color: '#45B7D1' },
    { name: 'Premium', slug: 'premium', color: '#FFA726' },
    { name: 'Trending', slug: 'trending', color: '#AB47BC' },
    { name: 'Recommended', slug: 'recommended', color: '#66BB6A' },
    { name: 'Limited Time', slug: 'limited-time', color: '#E57373' },
    { name: 'Exclusive', slug: 'exclusive', color: '#FFD54F' },
    { name: 'Seasonal', slug: 'seasonal', color: '#8BC34A' },
    { name: 'VIP', slug: 'vip', color: '#9C27B0' },
    { name: 'Early Bird', slug: 'early-bird', color: '#FF9800' },
    { name: 'Last Chance', slug: 'last-chance', color: '#F44336' },
  ];

  for (const tenant of Object.values(SAMPLE_TENANTS)) {
    for (const tagSpec of sampleTags) {
      const categoryId = categories.length > 0 
        ? categories[Math.floor(Math.random() * categories.length)].id 
        : null;

      await prisma.tag.create({
        data: {
          id: uuidv4(),
          tenant_id: tenant,
          category_id: categoryId,
          name: tagSpec.name,
          slug: tagSpec.slug,
          description: `${tagSpec.name} content tag for enhanced categorization`,
          color: tagSpec.color,
          is_system: Math.random() > 0.7, // 30% chance of being system tag
          is_active: true,
          usage_count: Math.floor(Math.random() * 200),
          metadata: {
            seed_data: true,
            example_tag: true,
            color_scheme: 'material_design',
            created_for_demo: true,
          },
          created_by: SAMPLE_USERS.system,
          updated_by: SAMPLE_USERS.system,
        },
      });
    }
  }

  console.log(`  🏷️  Created ${sampleTags.length} tags for each tenant (${Object.values(SAMPLE_TENANTS).length} tenants)`);
}

async function seedEntityTags(): Promise<void> {
  console.log('🔗 Seeding entity tag assignments...');

  const tags = await prisma.tag.findMany({
    take: 15,
    where: {
      tenant_id: SAMPLE_TENANTS.default,
      is_active: true,
    },
    orderBy: {
      usage_count: 'desc',
    },
  });

  const entityTypes = ['event', 'venue', 'user', 'content', 'brand', 'campaign'];
  const assignmentMethods = ['user', 'ai', 'system', 'import'];

  // Create varied entity tag assignments
  for (let i = 0; i < 75; i++) {
    const tag = tags[Math.floor(Math.random() * tags.length)];
    const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
    const assignedBy = assignmentMethods[Math.floor(Math.random() * assignmentMethods.length)];

    await prisma.entityTag.create({
      data: {
        id: uuidv4(),
        tenant_id: SAMPLE_TENANTS.default,
        entity_type: entityType,
        entity_id: uuidv4(), // Random entity ID for demo
        tag_id: tag.id,
        confidence_score: Math.random() * 0.5 + 0.5, // 0.5 to 1.0 for realistic confidence
        assigned_by: assignedBy as any,
        metadata: {
          seed_data: true,
          demo_entity_tag: true,
          assignment_context: `Demo assignment for ${entityType}`,
          batch_id: `seed_batch_${Math.floor(i / 10) + 1}`,
        },
        created_by: SAMPLE_USERS.system,
        updated_by: SAMPLE_USERS.system,
      },
    });
  }

  console.log('  🔗 Created 75 sample entity tag assignments with varied confidence scores');
}

async function updateCategoryUsageCounts(): Promise<void> {
  console.log('📊 Updating category usage counts...');

  const categories = await prisma.category.findMany({
    where: {
      tenant_id: SAMPLE_TENANTS.default,
    },
    include: {
      classifications: true,
    },
  });

  for (const category of categories) {
    const actualUsageCount = category.classifications.length;
    
    await prisma.category.update({
      where: { id: category.id },
      data: {
        usage_count: actualUsageCount,
        updated_by: SAMPLE_USERS.system,
      },
    });
  }

  console.log(`  📊 Updated usage counts for ${categories.length} categories`);
}

async function updateTagUsageCounts(): Promise<void> {
  console.log('🏷️  Updating tag usage counts...');

  const tags = await prisma.tag.findMany({
    where: {
      tenant_id: SAMPLE_TENANTS.default,
    },
    include: {
      entity_tags: true,
    },
  });

  for (const tag of tags) {
    const actualUsageCount = tag.entity_tags.length;
    
    await prisma.tag.update({
      where: { id: tag.id },
      data: {
        usage_count: actualUsageCount,
        updated_by: SAMPLE_USERS.system,
      },
    });
  }

  console.log(`  🏷️  Updated usage counts for ${tags.length} tags`);
}

async function main(): Promise<void> {
  try {
    console.log('🚀 Starting Taxonomy Service Database Seeding...\n');
    console.log('📋 Configuration:');
    console.log(`    - Service: taxonomy:3201`);
    console.log(`    - Database cluster: 2 (per registry)`);
    console.log(`    - Multi-tenant: ${Object.keys(SAMPLE_TENANTS).length} tenants`);
    console.log('');

    // Clear existing data in dependency order
    console.log('🧹 Cleaning existing seed data...');
    
    // Delete in reverse dependency order
    await prisma.entityTag.deleteMany({
      where: {
        metadata: { path: ['seed_data'], equals: true },
      },
    });
    
    await prisma.classification.deleteMany({
      where: {
        metadata: { path: ['seed_data'], equals: true },
      },
    });
    
    await prisma.tag.deleteMany({
      where: {
        metadata: { path: ['seed_data'], equals: true },
      },
    });
    
    await prisma.category.deleteMany({
      where: {
        metadata: { path: ['seed_data'], equals: true },
      },
    });
    
    await prisma.taxonomy.deleteMany({
      where: {
        metadata: { path: ['seed_data'], equals: true },
      },
    });
    
    await prisma.namespace.deleteMany({
      where: {
        metadata: { path: ['seed_data'], equals: true },
      },
    });
    
    console.log('✅ Cleaned existing seed data\n');

    // Seed all data in dependency order
    await seedNamespaces();
    await seedTaxonomies();
    await seedClassifications();
    await seedTags();
    await seedEntityTags();
    
    // Update usage counts based on actual relationships
    await updateCategoryUsageCounts();
    await updateTagUsageCounts();

    // Generate final statistics
    console.log('\n📊 Seeding Summary:');
    const counts = await Promise.all([
      prisma.namespace.count({ where: { metadata: { path: ['seed_data'], equals: true } } }),
      prisma.taxonomy.count({ where: { metadata: { path: ['seed_data'], equals: true } } }),
      prisma.category.count({ where: { metadata: { path: ['seed_data'], equals: true } } }),
      prisma.classification.count({ where: { metadata: { path: ['seed_data'], equals: true } } }),
      prisma.tag.count({ where: { metadata: { path: ['seed_data'], equals: true } } }),
      prisma.entityTag.count({ where: { metadata: { path: ['seed_data'], equals: true } } }),
    ]);

    const [namespaceCount, taxonomyCount, categoryCount, classificationCount, tagCount, entityTagCount] = counts;
    const totalRecords = counts.reduce((sum, count) => sum + count, 0);

    console.log(`    - Namespaces: ${namespaceCount}`);
    console.log(`    - Taxonomies: ${taxonomyCount}`);
    console.log(`    - Categories: ${categoryCount}`);
    console.log(`    - Classifications: ${classificationCount}`);
    console.log(`    - Tags: ${tagCount}`);
    console.log(`    - Entity Tags: ${entityTagCount}`);
    console.log(`    - Total Records: ${totalRecords}`);

    // Performance validation
    console.log('\n⚡ Performance Validation:');
    const startTime = Date.now();
    
    // Test a complex hierarchy query
    await prisma.category.findMany({
      where: {
        tenant_id: SAMPLE_TENANTS.default,
        level: { lte: 2 },
      },
      include: {
        children: {
          include: {
            classifications: true,
          },
        },
        taxonomy: true,
      },
      take: 10,
    });
    
    const queryTime = Date.now() - startTime;
    console.log(`    - Complex hierarchy query: ${queryTime}ms`);
    
    if (queryTime > 500) {
      console.log('    ⚠️  Query performance may need optimization');
    } else {
      console.log('    ✅ Query performance within SLA targets');
    }

    console.log('\n✅ Taxonomy Service Database Seeding Complete!');
    console.log('🌐 Service ready at: http://localhost:3201');
    console.log('📊 Health check: GET /health');
    console.log('📚 API docs: GET /docs');
    console.log('🔍 Search test: GET /search?q=music');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('💥 Fatal error during database seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    console.log('🔌 Disconnecting from database...');
    await prisma.$disconnect();
    console.log('👋 Database connection closed');
  });
