// API response types for the taxonomy service

export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface Namespace extends BaseEntity {
  name: string
  display_name?: string
  description?: string
  entity_types: string[]
  metadata?: Record<string, any>
  category_count?: number
}

export interface Category extends BaseEntity {
  name: string
  display_name?: string
  description?: string
  namespace_id: string
  parent_id?: string
  entity_count?: number
  metadata?: Record<string, any>
  
  // Computed fields
  children?: Category[]
  level?: number
  path?: string[]
}

export interface Classification extends BaseEntity {
  entity_id: string
  entity_type: string
  category_id: string
  namespace_id: string
  confidence_score?: number
  metadata?: Record<string, any>
  
  // Relations
  category?: Category
  namespace?: Namespace
}

export interface Tag extends BaseEntity {
  name: string
  display_name?: string
  description?: string
  color?: string
  metadata?: Record<string, any>
}

export interface EntityClassification {
  entity_id: string
  entity_type: string
  classifications: Classification[]
  tags?: Tag[]
  metadata?: Record<string, any>
}

// API request types
export interface CreateNamespaceRequest {
  name: string
  display_name?: string
  description?: string
  entity_types: string[]
  metadata?: Record<string, any>
}

export interface UpdateNamespaceRequest extends Partial<CreateNamespaceRequest> {
  is_active?: boolean
}

export interface CreateCategoryRequest {
  name: string
  display_name?: string
  description?: string
  namespace_id: string
  parent_id?: string
  metadata?: Record<string, any>
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  is_active?: boolean
}

export interface CreateClassificationRequest {
  entity_id: string
  entity_type: string
  category_id: string
  namespace_id: string
  confidence_score?: number
  metadata?: Record<string, any>
}

export interface UpdateClassificationRequest extends Partial<CreateClassificationRequest> {
  is_active?: boolean
}

export interface CreateTagRequest {
  name: string
  display_name?: string
  description?: string
  color?: string
  metadata?: Record<string, any>
}

export interface UpdateTagRequest extends Partial<CreateTagRequest> {
  is_active?: boolean
}

// Query parameters
export interface GetCategoriesParams {
  namespace_id?: string
  parent_id?: string | null
  include_inactive?: boolean
  search?: string
  limit?: number
  offset?: number
}

export interface GetClassificationsParams {
  entity_id?: string
  entity_type?: string
  category_id?: string
  namespace_id?: string
  include_inactive?: boolean
  limit?: number
  offset?: number
}

export interface GetNamespacesParams {
  entity_type?: string
  include_inactive?: boolean
  search?: string
  limit?: number
  offset?: number
}

// API response wrappers
export interface ApiResponse<T> {
  data: T
  message?: string
  status: 'success' | 'error'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    limit: number
    offset: number
    has_more: boolean
  }
}

export interface BulkOperationResult {
  success: number
  failed: number
  errors: Array<{
    line?: number
    item?: any
    error: string
  }>
}

// Health check
export interface HealthStatus {
  status: 'healthy' | 'unhealthy'
  version: string
  timestamp: string
  dependencies: {
    database: 'healthy' | 'unhealthy'
    cache: 'healthy' | 'unhealthy'
  }
}

// Error types
export interface ApiError {
  message: string
  code?: string
  details?: Record<string, any>
  timestamp: string
}

// Search types
export interface SearchResult<T> {
  items: T[]
  total: number
  query: string
  filters?: Record<string, any>
  suggestions?: string[]
}
