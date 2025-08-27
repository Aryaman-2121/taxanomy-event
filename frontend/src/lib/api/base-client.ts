/**
 * Base API client with common HTTP methods and error handling
 */

export interface RequestConfig {
  headers?: Record<string, string>
  signal?: AbortSignal
  timeout?: number
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class BaseApiClient {
  protected baseURL: string
  protected defaultHeaders: Record<string, string>
  protected timeout: number

  constructor(baseURL: string, endpoint?: string) {
    this.baseURL = endpoint ? `${baseURL}/${endpoint}` : baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
    this.timeout = 10000 // 10 seconds
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string) {
    this.defaultHeaders.Authorization = `Bearer ${token}`
  }

  /**
   * Remove authentication token
   */
  removeAuthToken() {
    delete this.defaultHeaders.Authorization
  }

  /**
   * Make a generic HTTP request
   */
  protected async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`
    
    const headers = {
      ...this.defaultHeaders,
      ...config?.headers,
    }

    const requestConfig: RequestInit = {
      method,
      headers,
      signal: config?.signal,
    }

    if (data && method !== 'GET') {
      if (data instanceof FormData) {
        // Remove Content-Type header for FormData to let browser set it with boundary
        delete headers['Content-Type']
        requestConfig.body = data
      } else {
        requestConfig.body = JSON.stringify(data)
      }
    }

    try {
      const timeoutId = setTimeout(() => {
        if (config?.signal && !config.signal.aborted) {
          const controller = new AbortController()
          controller.abort()
        }
      }, config?.timeout || this.timeout)

      const response = await fetch(fullUrl, requestConfig)
      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        let errorDetails: any = null

        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
          errorDetails = errorData.details || errorData
        } catch {
          // If error response is not JSON, use status text
        }

        throw new ApiError(errorMessage, response.status, undefined, errorDetails)
      }

      // Handle different response types
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        return await response.json()
      } else if (contentType?.includes('text/')) {
        return (await response.text()) as unknown as T
      } else {
        return (await response.blob()) as unknown as T
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408)
        }
        throw new ApiError(`Network error: ${error.message}`, 0)
      }
      
      throw new ApiError('Unknown error occurred', 0)
    }
  }

  /**
   * GET request
   */
  protected async get<T>(url: string, params?: Record<string, any>, config?: RequestConfig): Promise<T> {
    let fullUrl = url
    
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      
      const paramString = searchParams.toString()
      if (paramString) {
        fullUrl += (url.includes('?') ? '&' : '?') + paramString
      }
    }
    
    return this.request<T>('GET', fullUrl, undefined, config)
  }

  /**
   * POST request
   */
  protected async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', url, data, config)
  }

  /**
   * PUT request
   */
  protected async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', url, data, config)
  }

  /**
   * PATCH request
   */
  protected async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PATCH', url, data, config)
  }

  /**
   * DELETE request
   */
  protected async del<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config)
  }

  /**
   * GET request that returns a Blob (for file downloads)
   */
  protected async getBlob(url: string, params?: Record<string, any>, config?: RequestConfig): Promise<Blob> {
    let fullUrl = url
    
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      
      const paramString = searchParams.toString()
      if (paramString) {
        fullUrl += (url.includes('?') ? '&' : '?') + paramString
      }
    }
    
    const response = await fetch(`${this.baseURL}${fullUrl}`, {
      method: 'GET',
      headers: this.defaultHeaders,
      signal: config?.signal,
    })

    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status)
    }

    return response.blob()
  }

  /**
   * POST request with FormData
   */
  protected async postFormData<T>(url: string, formData: FormData, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', url, formData, config)
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health')
  }
}

// Utility function to create query parameters
export function createQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)))
      } else {
        searchParams.append(key, String(value))
      }
    }
  })
  
  return searchParams.toString()
}

// Utility function for request retry logic
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const backoffDelay = delay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, backoffDelay))
      }
    }
  }

  throw lastError!
}
