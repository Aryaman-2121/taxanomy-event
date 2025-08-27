import { BaseApiClient } from './base-client'
import { 
  Category, 
  CreateCategoryRequest, 
  UpdateCategoryRequest, 
  GetCategoriesParams,
  PaginatedResponse,
  ApiResponse 
} from './types'

export class CategoryApiClient extends BaseApiClient {
  constructor(baseURL: string) {
    super(baseURL, 'categories')
  }

  /**
   * Get all categories with optional filtering
   */
  async getAll(params?: GetCategoriesParams): Promise<Category[]> {
    const response = await this.get<PaginatedResponse<Category>>('', params)
    return response.data
  }

  /**
   * Get a category by ID
   */
  async getById(id: string): Promise<Category> {
    const response = await this.get<ApiResponse<Category>>(`/${id}`)
    return response.data
  }

  /**
   * Get categories by namespace
   */
  async getByNamespace(namespaceId: string, params?: Omit<GetCategoriesParams, 'namespace_id'>): Promise<Category[]> {
    const response = await this.get<PaginatedResponse<Category>>('', {
      ...params,
      namespace_id: namespaceId
    })
    return response.data
  }

  /**
   * Get root categories (no parent) for a namespace
   */
  async getRootCategories(namespaceId: string): Promise<Category[]> {
    const response = await this.get<PaginatedResponse<Category>>('', {
      namespace_id: namespaceId,
      parent_id: null
    })
    return response.data
  }

  /**
   * Get child categories of a parent category
   */
  async getChildren(parentId: string): Promise<Category[]> {
    const response = await this.get<PaginatedResponse<Category>>('', {
      parent_id: parentId
    })
    return response.data
  }

  /**
   * Get category tree for a namespace
   */
  async getTree(namespaceId: string): Promise<Category[]> {
    const response = await this.get<ApiResponse<Category[]>>(`/tree/${namespaceId}`)
    return response.data
  }

  /**
   * Create a new category
   */
  async create(data: CreateCategoryRequest): Promise<Category> {
    const response = await this.post<ApiResponse<Category>>('', data)
    return response.data
  }

  /**
   * Update a category
   */
  async update(id: string, data: UpdateCategoryRequest): Promise<Category> {
    const response = await this.put<ApiResponse<Category>>(`/${id}`, data)
    return response.data
  }

  /**
   * Delete a category
   */
  async delete(id: string): Promise<void> {
    await this.del(`/${id}`)
  }

  /**
   * Bulk delete categories
   */
  async bulkDelete(ids: string[]): Promise<void> {
    await this.post('/bulk-delete', { ids })
  }

  /**
   * Move a category to a new parent
   */
  async move(id: string, newParentId: string | null): Promise<Category> {
    const response = await this.post<ApiResponse<Category>>(`/${id}/move`, {
      parent_id: newParentId
    })
    return response.data
  }

  /**
   * Duplicate a category
   */
  async duplicate(id: string, newName?: string): Promise<Category> {
    const response = await this.post<ApiResponse<Category>>(`/${id}/duplicate`, {
      name: newName
    })
    return response.data
  }

  /**
   * Search categories
   */
  async search(query: string, namespaceId?: string): Promise<Category[]> {
    const params: Record<string, string> = { search: query }
    if (namespaceId) params.namespace_id = namespaceId
    
    const response = await this.get<PaginatedResponse<Category>>('/search', params)
    return response.data
  }

  /**
   * Get category statistics
   */
  async getStats(id: string): Promise<{
    entity_count: number
    child_count: number
    depth: number
  }> {
    const response = await this.get<ApiResponse<any>>(`/${id}/stats`)
    return response.data
  }

  /**
   * Validate category data
   */
  async validate(data: CreateCategoryRequest | UpdateCategoryRequest): Promise<{
    valid: boolean
    errors: string[]
  }> {
    const response = await this.post<ApiResponse<any>>('/validate', data)
    return response.data
  }

  /**
   * Export categories
   */
  async export(namespaceId?: string, format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const params: Record<string, string> = { format }
    if (namespaceId) params.namespace_id = namespaceId
    
    return this.getBlob('/export', params)
  }

  /**
   * Import categories
   */
  async import(file: File, namespaceId: string): Promise<{
    success: number
    failed: number
    errors: Array<{ line: number; error: string }>
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('namespace_id', namespaceId)
    
    const response = await this.postFormData<ApiResponse<any>>('/import', formData)
    return response.data
  }
}

// Create singleton instance
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
export const categoryApi = new CategoryApiClient(`${baseURL}/api/v1`)
