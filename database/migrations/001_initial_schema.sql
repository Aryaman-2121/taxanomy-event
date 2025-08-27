-- Copyright (c) 2025 Eventful India Marketing Services, India
-- All rights reserved.
-- 
-- Service: taxonomy
-- Port: 3201
-- Migration: 001_initial_schema
-- Description: Create initial taxonomy service schema with multi-tenant support
-- Author: Eventzr Platform Team
-- Date: 2025-08-26T19:30:00Z

BEGIN;

-- Create custom types/enums
DO $$ BEGIN
    CREATE TYPE taxonomy_status AS ENUM ('draft', 'active', 'deprecated', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE classification_status AS ENUM ('pending', 'confirmed', 'rejected', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE assignment_method AS ENUM ('system', 'user', 'ai', 'import');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE namespace_type AS ENUM ('system', 'custom', 'predefined');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create taxonomies table
CREATE TABLE IF NOT EXISTS taxonomies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    namespace VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    status taxonomy_status NOT NULL DEFAULT 'draft',
    is_system BOOLEAN NOT NULL DEFAULT false,
    is_hierarchical BOOLEAN NOT NULL DEFAULT true,
    max_depth INTEGER NOT NULL DEFAULT 6,
    metadata JSONB,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT taxonomies_max_depth_check CHECK (max_depth > 0 AND max_depth <= 8),
    CONSTRAINT taxonomies_version_check CHECK (version > 0),
    CONSTRAINT taxonomies_tenant_namespace_slug_unique UNIQUE (tenant_id, namespace, slug)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    taxonomy_id UUID NOT NULL,
    parent_id UUID,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 0,
    path TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_leaf BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    ai_generated BOOLEAN NOT NULL DEFAULT false,
    confidence_score REAL,
    usage_count INTEGER NOT NULL DEFAULT 0,
    metadata JSONB,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT categories_level_check CHECK (level >= 0 AND level <= 8),
    CONSTRAINT categories_confidence_check CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)),
    CONSTRAINT categories_usage_count_check CHECK (usage_count >= 0),
    CONSTRAINT categories_tenant_taxonomy_slug_unique UNIQUE (tenant_id, taxonomy_id, slug),
    CONSTRAINT categories_taxonomy_fk FOREIGN KEY (taxonomy_id) REFERENCES taxonomies(id) ON DELETE CASCADE,
    CONSTRAINT categories_parent_fk FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Create classifications table
CREATE TABLE IF NOT EXISTS classifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    taxonomy_id UUID NOT NULL,
    category_id UUID NOT NULL,
    confidence_score REAL NOT NULL DEFAULT 1.0,
    assigned_by assignment_method NOT NULL DEFAULT 'user',
    status classification_status NOT NULL DEFAULT 'confirmed',
    expires_at TIMESTAMPTZ,
    metadata JSONB,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT classifications_confidence_check CHECK (confidence_score >= 0 AND confidence_score <= 1),
    CONSTRAINT classifications_tenant_entity_category_unique UNIQUE (tenant_id, entity_type, entity_id, category_id),
    CONSTRAINT classifications_taxonomy_fk FOREIGN KEY (taxonomy_id) REFERENCES taxonomies(id) ON DELETE CASCADE,
    CONSTRAINT classifications_category_fk FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create namespaces table
CREATE TABLE IF NOT EXISTS namespaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    type namespace_type NOT NULL DEFAULT 'custom',
    is_system BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    quota_limit INTEGER,
    quota_used INTEGER NOT NULL DEFAULT 0,
    metadata JSONB,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT namespaces_quota_check CHECK (quota_limit IS NULL OR quota_limit > 0),
    CONSTRAINT namespaces_quota_used_check CHECK (quota_used >= 0),
    CONSTRAINT namespaces_tenant_slug_unique UNIQUE (tenant_id, slug)
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    category_id UUID,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color code
    is_system BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    usage_count INTEGER NOT NULL DEFAULT 0,
    metadata JSONB,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT tags_usage_count_check CHECK (usage_count >= 0),
    CONSTRAINT tags_color_check CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT tags_tenant_slug_unique UNIQUE (tenant_id, slug),
    CONSTRAINT tags_category_fk FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Create entity_tags table
CREATE TABLE IF NOT EXISTS entity_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    confidence_score REAL NOT NULL DEFAULT 1.0,
    assigned_by assignment_method NOT NULL DEFAULT 'user',
    metadata JSONB,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT entity_tags_confidence_check CHECK (confidence_score >= 0 AND confidence_score <= 1),
    CONSTRAINT entity_tags_tenant_entity_tag_unique UNIQUE (tenant_id, entity_type, entity_id, tag_id),
    CONSTRAINT entity_tags_tag_fk FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Create indexes for performance
-- Taxonomies indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_taxonomies_tenant_id ON taxonomies(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_taxonomies_tenant_namespace ON taxonomies(tenant_id, namespace);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_taxonomies_tenant_status ON taxonomies(tenant_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_taxonomies_namespace_status ON taxonomies(namespace, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_taxonomies_slug ON taxonomies(slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_taxonomies_created_at ON taxonomies(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_taxonomies_updated_at ON taxonomies(updated_at);

-- Categories indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_tenant_id ON categories(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_tenant_taxonomy ON categories(tenant_id, taxonomy_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_tenant_taxonomy_parent ON categories(tenant_id, taxonomy_id, parent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_taxonomy_level ON categories(taxonomy_id, level);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_path ON categories USING GIN(path gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_usage_count ON categories(usage_count DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_ai_confidence ON categories(ai_generated, confidence_score) WHERE ai_generated = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_created_at ON categories(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_updated_at ON categories(updated_at);

-- Classifications indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classifications_tenant_id ON classifications(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classifications_tenant_entity_type ON classifications(tenant_id, entity_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classifications_tenant_entity ON classifications(tenant_id, entity_type, entity_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classifications_entity ON classifications(entity_type, entity_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classifications_category_id ON classifications(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classifications_taxonomy_id ON classifications(taxonomy_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classifications_status ON classifications(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classifications_assigned_by ON classifications(assigned_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classifications_confidence_score ON classifications(confidence_score DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classifications_expires_at ON classifications(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classifications_created_at ON classifications(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classifications_updated_at ON classifications(updated_at);

-- Namespaces indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_namespaces_tenant_id ON namespaces(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_namespaces_tenant_type ON namespaces(tenant_id, type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_namespaces_tenant_active ON namespaces(tenant_id, is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_namespaces_type ON namespaces(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_namespaces_is_system ON namespaces(is_system);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_namespaces_created_at ON namespaces(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_namespaces_updated_at ON namespaces(updated_at);

-- Tags indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tags_tenant_id ON tags(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tags_tenant_category ON tags(tenant_id, category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tags_category_id ON tags(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tags_name ON tags USING GIN(name gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tags_is_active ON tags(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tags_usage_count ON tags(usage_count DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tags_created_at ON tags(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tags_updated_at ON tags(updated_at);

-- Entity tags indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_tags_tenant_id ON entity_tags(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_tags_tenant_entity_type ON entity_tags(tenant_id, entity_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_tags_tenant_entity ON entity_tags(tenant_id, entity_type, entity_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_tags_entity ON entity_tags(entity_type, entity_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_tags_tag_id ON entity_tags(tag_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_tags_assigned_by ON entity_tags(assigned_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_tags_confidence_score ON entity_tags(confidence_score DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_tags_created_at ON entity_tags(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_tags_updated_at ON entity_tags(updated_at);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER trigger_taxonomies_updated_at 
    BEFORE UPDATE ON taxonomies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_classifications_updated_at 
    BEFORE UPDATE ON classifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_namespaces_updated_at 
    BEFORE UPDATE ON namespaces 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_tags_updated_at 
    BEFORE UPDATE ON tags 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_entity_tags_updated_at 
    BEFORE UPDATE ON entity_tags 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE taxonomies IS 'Root taxonomy definitions and metadata';
COMMENT ON TABLE categories IS 'Hierarchical categories within taxonomies';
COMMENT ON TABLE classifications IS 'Entity to category assignments';
COMMENT ON TABLE namespaces IS 'Logical grouping of taxonomies';
COMMENT ON TABLE tags IS 'Flexible tagging system';
COMMENT ON TABLE entity_tags IS 'Entity to tag assignments';

COMMENT ON COLUMN categories.path IS 'Materialized path for efficient hierarchy queries (e.g., /root/parent/child/)';
COMMENT ON COLUMN categories.level IS 'Hierarchy depth, 0 for root categories';
COMMENT ON COLUMN categories.is_leaf IS 'Indicates if category has no children';
COMMENT ON COLUMN classifications.confidence_score IS 'AI confidence score for classification (0.0-1.0)';
COMMENT ON COLUMN classifications.expires_at IS 'Optional expiration for temporary classifications';

COMMIT;
