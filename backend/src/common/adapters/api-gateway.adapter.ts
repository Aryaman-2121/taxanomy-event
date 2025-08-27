/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * API Gateway Adapter - Golden Rules #3, #4, #5
 * Template: Eventzr Code Repository Template v1.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface ApiGatewayRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  data?: any;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiGatewayResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ApiGatewayAdapter {
  private readonly logger = new Logger(ApiGatewayAdapter.name);
  private readonly httpClient: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const gatewayConfig = this.configService.get('integration.apiGateway');
    
    this.httpClient = axios.create({
      baseURL: gatewayConfig.baseUrl,
      timeout: gatewayConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'taxonomy-service/1.0.0',
        'X-Service-Name': 'taxonomy',
        'X-Service-Version': '1.0.0',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Golden Rule #3: Internal APIs via api-gateway
   */
  async callInternalService<T>(request: ApiGatewayRequest): Promise<ApiGatewayResponse<T>> {
    try {
      const config: AxiosRequestConfig = {
        method: request.method,
        url: request.path,
        data: request.data,
        params: request.params,
        headers: {
          ...request.headers,
          'X-Internal-Request': 'true',
        },
        timeout: request.timeout,
      };

      const response = await this.httpClient.request(config);
      
      return {
        success: true,
        data: response.data,
        metadata: {
          status: response.status,
          headers: response.headers,
        },
      };
    } catch (error) {
      this.logger.error('Internal service call failed', {
        path: request.path,
        method: request.method,
        error: (error as Error).message,
      });

      return {
        success: false,
        error: (error as Error).message,
        metadata: {
          status: (error as any).response?.status,
          path: request.path,
          method: request.method,
        },
      };
    }
  }

  /**
   * Golden Rule #4: External APIs via integration-hub
   */
  async callExternalService<T>(
    endpoint: string, 
    method: string = 'GET',
    data?: any,
    options?: Record<string, any>
  ): Promise<ApiGatewayResponse<T>> {
    return this.callInternalService<T>({
      method: 'POST',
      path: '/v1/integration-hub/external',
      data: {
        endpoint,
        method,
        data,
        options,
      },
    });
  }

  /**
   * Golden Rule #5: AI queries via api-gateway → ailabs → mcp-gateway (updated pattern)
   */
  async queryAI(
    prompt: string,
    context?: Record<string, any>,
    options?: {
      requiresMCP?: boolean;
      mcpService?: string;
      model?: string;
      maxTokens?: number;
    }
  ): Promise<ApiGatewayResponse<string>> {
    return this.callInternalService<string>({
      method: 'POST',
      path: '/v1/ailabs/query',
      data: {
        query: prompt,
        context: context,
        requiresMCP: options?.requiresMCP || true,
        mcpService: options?.mcpService || 'mcp-events',
        model: options?.model,
        maxTokens: options?.maxTokens,
      },
      timeout: 60000, // Longer timeout for AI processing
    });
  }

  /**
   * Call masterdata service (registry dependency)
   */
  async getMasterdata(
    type: string,
    filters?: Record<string, any>
  ): Promise<ApiGatewayResponse<any[]>> {
    return this.callInternalService({
      method: 'GET',
      path: '/v1/masterdata/lookup',
      params: {
        type,
        ...filters,
      },
    });
  }

  /**
   * Call secrets-kms service (registry dependency)
   */
  async getSecret(
    secretName: string,
    version?: string
  ): Promise<ApiGatewayResponse<string>> {
    return this.callInternalService({
      method: 'POST',
      path: '/v1/secrets-kms/retrieve',
      data: {
        secret_name: secretName,
        version,
      },
    });
  }

  /**
   * GET request helper
   */
  async get<T>(path: string, params?: Record<string, any>): Promise<ApiGatewayResponse<T>> {
    return this.callInternalService<T>({
      method: 'GET',
      path,
      params,
    });
  }

  /**
   * POST request helper
   */
  async post<T>(path: string, data?: any): Promise<ApiGatewayResponse<T>> {
    return this.callInternalService<T>({
      method: 'POST',
      path,
      data,
    });
  }

  /**
   * PUT request helper
   */
  async put<T>(path: string, data?: any): Promise<ApiGatewayResponse<T>> {
    return this.callInternalService<T>({
      method: 'PUT',
      path,
      data,
    });
  }

  /**
   * DELETE request helper
   */
  async delete<T>(path: string): Promise<ApiGatewayResponse<T>> {
    return this.callInternalService<T>({
      method: 'DELETE',
      path,
    });
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.httpClient.interceptors.request.use(
      (config) => {
        // Add correlation ID if not present
        if (!config.headers['X-Correlation-ID']) {
          config.headers['X-Correlation-ID'] = this.generateCorrelationId();
        }

        // Add timestamp
        config.headers['X-Request-Timestamp'] = new Date().toISOString();

        this.logger.debug('API Gateway request', {
          method: config.method,
          url: config.url,
          correlationId: config.headers['X-Correlation-ID'],
        });

        return config;
      },
      (error) => {
        this.logger.error('API Gateway request error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug('API Gateway response', {
          status: response.status,
          correlationId: response.headers['x-correlation-id'],
          duration: this.calculateDuration(response.config.headers['X-Request-Timestamp']),
        });

        return response;
      },
      (error) => {
        this.logger.error('API Gateway response error', {
          status: (error as any).response?.status,
          message: (error as Error).message,
          correlationId: error.config?.headers['X-Correlation-ID'],
        });

        return Promise.reject(error);
      }
    );

    // Setup retry logic
    this.setupRetryInterceptor();
  }

  /**
   * Setup retry interceptor for resilience
   */
  private setupRetryInterceptor(): void {
    const retryConfig = this.configService.get('integration.retry');
    
    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const { config } = error;
        
        if (!config || !config.retry) {
          config.retry = { count: 0, maxAttempts: retryConfig.maxAttempts };
        }

        const { count, maxAttempts } = config.retry;
        
        if (count < maxAttempts && this.isRetryableError(error)) {
          config.retry.count += 1;
          
          const delay = Math.min(
            retryConfig.baseDelay * Math.pow(2, count),
            retryConfig.maxDelay
          );
          
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return this.httpClient(config);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (!(error as any).response) return true; // Network error
    
    const status = (error as any).response.status;
    return status >= 500 || status === 429; // Server error or rate limited
  }

  /**
   * Generate correlation ID
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate request duration
   */
  private calculateDuration(startTime: string): number {
    if (!startTime) return 0;
    return Date.now() - new Date(startTime).getTime();
  }
}



