/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * API Client - Generated from OpenAPI
 * Template: Eventzr Code Repository Template v1.0
 * 
 * Architecture: Multi-tenant with RLS
 * Architecture: Adapter pattern for external services
 * Architecture: Gateway routing via api-gateway (3000)
 * Dependencies: secrets-kms:3000, masterdata:3200
 * Golden Rules: [1,2,3,4,5,6,7,8,9,10,11,12]
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/stores/auth-store';

// Types from OpenAPI specification
export interface Namespace {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  status: 'active' | 'inactive' | 'deprecated';
  created_at: string;
  updated_at: string;
  tenant_id: string;
  metadata?: Record<string, any>;
  quota_categories?: number;
  quota_classifications?: number;
}

export interface Category {
  id: string;
  namespace_id: string;
  entity_type: string;
  name: string;
  display_name: string;
  description?: string;
  parent_id?: string;
  status: 'draft' | 'active' | 'deprecated' | 'archived';
  materialized_path: string;
  depth: number;
  sort_order: number;
  is_leaf: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  children?: Category[];
  breadcrumb?: string[];
}

export interface Classification {
  id: string;
  entity_type: string;
  entity_id: string;
  category_id: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'expired';
  confidence_score: number;
  assigned_by: 'system' | 'user' | 'ai' | 'import';
  assigned_at: string;
  confirmed_at?: string;
  expires_at?: string;
  metadata?: Record<string, any>;
  tenant_id: string;
  category?: Category;
}

export interface Tag {
  id: string;
  name: string;
  display_name: string;
  namespace_id: string;
  color?: string;
  description?: string;
  usage_count: number;
  status: 'active' | 'deprecated';
  created_at: string;
  updated_at: string;
  tenant_id: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  message?: string;
}

export interface StandardResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface SearchResponse {
  success: boolean;
  data: {
    categories: Category[];
    namespaces: Namespace[];
    tags: Tag[];
    classifications: Classification[];
  };
  total: number;
  query: string;
  suggestions?: string[];
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

// Request types
export interface CreateNamespaceRequest {
  name: string;
  display_name: string;
  description?: string;
  metadata?: Record<string, any>;
  quota_categories?: number;
  quota_classifications?: number;
}

export interface UpdateNamespaceRequest {
  display_name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'deprecated';
  metadata?: Record<string, any>;
  quota_categories?: number;
  quota_classifications?: number;
}

export interface CreateCategoryRequest {
  namespace_id: string;
  entity_type: string;
  name: string;
  display_name: string;
  description?: string;
  parent_id?: string;
  sort_order?: number;
  metadata?: Record<string, any>;
}

export interface UpdateCategoryRequest {
  display_name?: string;
  description?: string;
  parent_id?: string;
  status?: 'draft' | 'active' | 'deprecated' | 'archived';
  sort_order?: number;
  metadata?: Record<string, any>;
}

export interface CreateClassificationRequest {
  entity_type: string;
  entity_id: string;
  category_id: string;
  confidence_score?: number;
  assigned_by: 'system' | 'user' | 'ai' | 'import';
  expires_at?: string;
  metadata?: Record<string, any>;
}

export interface BulkClassificationRequest {
  classifications: CreateClassificationRequest[];
  mode: 'create' | 'update' | 'upsert';
  batch_size?: number;
}

export interface SearchRequest {
  query: string;
  type?: 'all' | 'categories' | 'namespaces' | 'tags' | 'classifications';
  namespace?: string;
  entity_type?: string;
  status?: string;
  limit?: number;
  include_suggestions?: boolean;
  include_facets?: boolean;
}

// Filter and query types
export interface NamespaceFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'deprecated';
  sort?: 'name' | 'created_at' | 'updated_at';
  order?: 'asc' | 'desc';
}

export interface CategoryFilters {
  namespace?: string;
  entity_type?: string;
  parent_id?: string;
  status?: 'draft' | 'active' | 'deprecated' | 'archived';
  search?: string;
  depth_min?: number;
  depth_max?: number;
  is_leaf?: boolean;
  sort?: 'name' | 'sort_order' | 'created_at' | 'updated_at';
  order?: 'asc' | 'desc';
}

export interface ClassificationFilters {
  entity_type?: string;
  entity_id?: string;
  category_id?: string;
  status?: 'pending' | 'confirmed' | 'rejected' | 'expired';
  assigned_by?: 'system' | 'user' | 'ai' | 'import';
  confidence_min?: number;
  confidence_max?: number;
  assigned_after?: string;
  assigned_before?: string;
  include_category?: boolean;
  sort?: 'confidence_score' | 'assigned_at' | 'created_at';
  order?: 'asc' | 'desc';
}

// API Client class
export class TaxonomyApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.eventzr.com';
    
    this.client = axios.create({
      baseURL: `${this.baseURL}/v1/taxonomy`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        const tenantId = useAuthStore.getState().user?.tenant_id;
        if (tenantId) {
          config.headers['X-Tenant-ID'] = tenantId;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout();
        }
        return Promise.reject(error);
      }
    );
  }

  // Namespace operations
  async getNamespaces(
    page = 1,
    limit = 20,
    filters: NamespaceFilters = {}
  ): Promise<PaginatedResponse<Namespace>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      ),
    });

    const response = await this.client.get(`/namespaces?${params}`);
    return response.data;
  }

  async getNamespace(id: string): Promise<StandardResponse<Namespace>> {
    const response = await this.client.get(`/namespaces/${id}`);
    return response.data;
  }

  async createNamespace(data: CreateNamespaceRequest): Promise<StandardResponse<Namespace>> {
    const response = await this.client.post('/namespaces', data);
    return response.data;
  }

  async updateNamespace(id: string, data: UpdateNamespaceRequest): Promise<StandardResponse<Namespace>> {
    const response = await this.client.put(`/namespaces/${id}`, data);
    return response.data;
  }

  async deleteNamespace(id: string): Promise<StandardResponse<void>> {
    const response = await this.client.delete(`/namespaces/${id}`);
    return response.data;
  }

  // Category operations
  async getCategories(
    page = 1,
    limit = 20,
    filters: CategoryFilters = {}
  ): Promise<PaginatedResponse<Category>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      ),
    });

    const response = await this.client.get(`/categories?${params}`);
    return response.data;
  }

  async getCategoryTree(
    namespace: string,
    entityType: string,
    parentId?: string,
    maxDepth = 5
  ): Promise<StandardResponse<Category[]>> {
    const params = new URLSearchParams({
      max_depth: maxDepth.toString(),
      ...(parentId && { parent_id: parentId }),
    });

    const response = await this.client.get(`/${namespace}/${entityType}/tree?${params}`);
    return response.data;
  }

  async getCategory(id: string): Promise<StandardResponse<Category>> {
    const response = await this.client.get(`/categories/${id}`);
    return response.data;
  }

  async createCategory(data: CreateCategoryRequest): Promise<StandardResponse<Category>> {
    const response = await this.client.post('/categories', data);
    return response.data;
  }

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<StandardResponse<Category>> {
    const response = await this.client.put(`/categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: string): Promise<StandardResponse<void>> {
    const response = await this.client.delete(`/categories/${id}`);
    return response.data;
  }

  async getCategoryBreadcrumb(id: string): Promise<StandardResponse<string[]>> {
    const response = await this.client.get(`/categories/${id}/breadcrumb`);
    return response.data;
  }

  async getCategoryChildren(id: string): Promise<StandardResponse<Category[]>> {
    const response = await this.client.get(`/categories/${id}/children`);
    return response.data;
  }

  async getRelatedCategories(id: string, limit = 10): Promise<StandardResponse<Category[]>> {
    const response = await this.client.get(`/categories/${id}/related?limit=${limit}`);
    return response.data;
  }

  // Classification operations
  async getClassifications(
    page = 1,
    limit = 20,
    filters: ClassificationFilters = {}
  ): Promise<PaginatedResponse<Classification>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      ),
    });

    const response = await this.client.get(`/classifications?${params}`);
    return response.data;
  }

  async getClassification(id: string): Promise<StandardResponse<Classification>> {
    const response = await this.client.get(`/classifications/${id}`);
    return response.data;
  }

  async createClassification(data: CreateClassificationRequest): Promise<StandardResponse<Classification>> {
    const response = await this.client.post('/classifications', data);
    return response.data;
  }

  async updateClassification(id: string, data: Partial<CreateClassificationRequest>): Promise<StandardResponse<Classification>> {
    const response = await this.client.put(`/classifications/${id}`, data);
    return response.data;
  }

  async deleteClassification(id: string): Promise<StandardResponse<void>> {
    const response = await this.client.delete(`/classifications/${id}`);
    return response.data;
  }

  async bulkClassifications(data: BulkClassificationRequest): Promise<StandardResponse<{ success: number; failed: number; errors: any[] }>> {
    const response = await this.client.post('/classifications/bulk', data);
    return response.data;
  }

  async getEntityClassifications(
    entityType: string,
    entityId: string
  ): Promise<StandardResponse<Classification[]>> {
    const response = await this.client.get(`/classifications/entity/${entityType}/${entityId}`);
    return response.data;
  }

  async getClassificationSuggestions(
    entityType: string,
    entityId: string,
    limit = 10
  ): Promise<StandardResponse<Array<{ category: Category; confidence: number; reason: string }>>> {
    const response = await this.client.get(
      `/classifications/suggestions/${entityType}/${entityId}?limit=${limit}`
    );
    return response.data;
  }

  // Search operations
  async search(data: SearchRequest): Promise<SearchResponse> {
    const response = await this.client.post('/search', data);
    return response.data;
  }

  async autocomplete(
    query: string,
    type: 'categories' | 'namespaces' | 'tags' = 'categories',
    limit = 10
  ): Promise<StandardResponse<string[]>> {
    const params = new URLSearchParams({
      q: query,
      type,
      limit: limit.toString(),
    });

    const response = await this.client.get(`/autocomplete?${params}`);
    return response.data;
  }

  // Health and utility operations
  async getHealth(): Promise<StandardResponse<{ status: string; checks: Record<string, string> }>> {
    const response = await this.client.get('/health');
    return response.data;
  }

  async getMetrics(): Promise<StandardResponse<Record<string, number>>> {
    const response = await this.client.get('/metrics');
    return response.data;
  }
}

// Export singleton instance
export const taxonomyApi = new TaxonomyApiClient();
export default taxonomyApi;
