/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Prisma Types Workaround
 * Template: Eventzr Code Repository Template v1.0
 */

// Temporary type definitions until Prisma client is properly generated
export enum TaxonomyStatus {
  draft = 'draft',
  active = 'active',
  deprecated = 'deprecated',
  archived = 'archived',
}

export enum ClassificationStatus {
  pending = 'pending',
  confirmed = 'confirmed',
  rejected = 'rejected',
  expired = 'expired',
}

export enum AssignmentMethod {
  system = 'system',
  user = 'user',
  ai = 'ai',
  import = 'import',
}

export enum NamespaceType {
  system = 'system',
  custom = 'custom',
  predefined = 'predefined',
}

export interface Taxonomy {
  id: string;
  tenant_id: string;
  namespace: string;
  name: string;
  slug: string;
  description?: string;
  version: number;
  status: TaxonomyStatus;
  is_system: boolean;
  is_hierarchical: boolean;
  max_depth: number;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  created_by?: string;
  updated_by?: string;
}

export interface Category {
  id: string;
  tenant_id: string;
  taxonomy_id: string;
  parent_id?: string;
  name: string;
  slug: string;
  description?: string;
  level: number;
  path: string;
  sort_order: number;
  is_leaf: boolean;
  is_active: boolean;
  ai_generated: boolean;
  confidence_score?: number;
  usage_count: number;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  created_by?: string;
  updated_by?: string;
}

export interface Classification {
  id: string;
  tenant_id: string;
  entity_type: string;
  entity_id: string;
  taxonomy_id: string;
  category_id: string;
  confidence_score: number;
  assigned_by: AssignmentMethod;
  status: ClassificationStatus;
  expires_at?: Date;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  created_by?: string;
  updated_by?: string;
}

// Prisma-like types
export namespace Prisma {
  export interface TaxonomyWhereInput {
    id?: string | { in?: string[] };
    tenant_id?: string;
    namespace?: string;
    name?: string | { contains?: string; mode?: 'insensitive' };
    slug?: string | { contains?: string; mode?: 'insensitive' };
    description?: string | { contains?: string; mode?: 'insensitive' };
    status?: TaxonomyStatus | { in?: TaxonomyStatus[] };
    is_system?: boolean;
    is_hierarchical?: boolean;
    created_at?: Date | { gte?: Date; lte?: Date };
    updated_at?: Date | { gte?: Date; lte?: Date };
    deleted_at?: Date | null;
    AND?: TaxonomyWhereInput[];
    OR?: TaxonomyWhereInput[];
    NOT?: TaxonomyWhereInput[];
  }

  export interface TaxonomyCreateInput {
    id?: string;
    tenant_id: string;
    namespace: string;
    name: string;
    slug: string;
    description?: string;
    version?: number;
    status?: TaxonomyStatus;
    is_system?: boolean;
    is_hierarchical?: boolean;
    max_depth?: number;
    metadata?: any;
    created_by?: string;
    updated_by?: string;
  }

  export interface TaxonomyUpdateInput {
    name?: string;
    slug?: string;
    description?: string;
    version?: number;
    status?: TaxonomyStatus;
    max_depth?: number;
    metadata?: any;
    updated_by?: string;
  }

  export interface TaxonomyOrderByInput {
    id?: 'asc' | 'desc';
    name?: 'asc' | 'desc';
    created_at?: 'asc' | 'desc';
    updated_at?: 'asc' | 'desc';
  }
}
