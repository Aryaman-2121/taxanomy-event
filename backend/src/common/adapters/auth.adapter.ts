/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Authentication Adapter - Golden Rule #1
 * Template: Eventzr Code Repository Template v1.0
 */

import { Injectable, Logger, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios, { AxiosInstance } from 'axios';

export interface AuthUser {
  id: string;
  tenantId: string;
  email: string;
  roles: string[];
  permissions: string[];
  scope: string[];
}

export interface AuthValidationRequest {
  token: string;
  requiredScopes?: string[];
  requiredRoles?: string[];
}

export interface AuthValidationResponse {
  valid: boolean;
  user?: AuthUser;
  error?: string;
}

@Injectable()
export class AuthAdapter {
  private readonly logger = new Logger(AuthAdapter.name);
  private readonly httpClient: AxiosInstance;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    const authConfig = this.configService.get('integration.auth');
    
    this.httpClient = axios.create({
      baseURL: authConfig.baseUrl,
      timeout: authConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'taxonomy-service/1.0.0',
      },
    });

    // Add retry interceptor
    this.setupRetryInterceptor();
  }

  /**
   * Validate JWT token via auth service (Golden Rule #1)
   */
  async validateToken(token: string): Promise<AuthUser> {
    try {
      const response = await this.httpClient.post('/v1/auth/validate', {
        token: token,
      });

      if (!response.data?.success) {
        throw new UnauthorizedException('Token validation failed');
      }

      return {
        id: response.data.user.id,
        tenantId: response.data.user.tenant_id,
        email: response.data.user.email,
        roles: response.data.user.roles || [],
        permissions: response.data.user.permissions || [],
        scope: response.data.user.scope || [],
      };
    } catch (error) {
      this.logger.error('Token validation failed', {
        error: (error as Error).message,
        token: token?.substring(0, 10) + '...',
      });

      if ((error as any).response?.status === 401) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      throw new UnauthorizedException('Authentication service unavailable');
    }
  }

  /**
   * Validate user has access to tenant
   */
  async validateTenantAccess(tenantId: string, userId: string): Promise<boolean> {
    try {
      const response = await this.httpClient.post('/v1/auth/tenant/validate', {
        tenant_id: tenantId,
        user_id: userId,
      });

      return response.data?.success && response.data?.authorized;
    } catch (error) {
      this.logger.error('Tenant access validation failed', {
        tenantId,
        userId,
        error: (error as Error).message,
      });
      
      throw new ForbiddenException('Tenant access validation failed');
    }
  }

  /**
   * Check if user has required permissions
   */
  async hasPermissions(user: AuthUser, requiredPermissions: string[]): Promise<boolean> {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission => 
      user.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      this.logger.warn('Insufficient permissions', {
        userId: user.id,
        required: requiredPermissions,
        available: user.permissions,
      });
    }

    return hasAllPermissions;
  }

  /**
   * Check if user has required roles
   */
  async hasRoles(user: AuthUser, requiredRoles: string[]): Promise<boolean> {
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some(role => 
      user.roles.includes(role)
    );

    if (!hasRequiredRole) {
      this.logger.warn('Insufficient roles', {
        userId: user.id,
        required: requiredRoles,
        available: user.roles,
      });
    }

    return hasRequiredRole;
  }

  /**
   * Get service-to-service token
   */
  async getServiceToken(): Promise<string> {
    try {
      const response = await this.httpClient.post('/v1/auth/service/token', {
        service: 'taxonomy',
        audience: 'internal',
      });

      if (!response.data?.success) {
        throw new Error('Failed to get service token');
      }

      return response.data.token;
    } catch (error) {
      this.logger.error('Service token request failed', error);
      throw new Error('Failed to get service token');
    }
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
}
