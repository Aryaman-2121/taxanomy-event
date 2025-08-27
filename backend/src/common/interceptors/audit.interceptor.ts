/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Audit Interceptor - Golden Rule #2
 * Template: Eventzr Code Repository Template v1.0
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { AuditAdapter } from '../adapters/audit.adapter';

export const SKIP_AUDIT_KEY = 'skipAudit';
export const SkipAudit = () => SetMetadata(SKIP_AUDIT_KEY, true);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly auditAdapter: AuditAdapter,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const shouldSkipAudit = this.reflector.getAllAndOverride<boolean>(
      SKIP_AUDIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (shouldSkipAudit) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();
    const user = (request as any).user;
    const requestContext = (request as any).context;

    // Skip audit for certain endpoints
    if (this.shouldSkipAudit(request)) {
      return next.handle();
    }

    const startTime = Date.now();
    const method = request.method;
    const path = request.path;
    const body = this.sanitizeRequestBody(request.body);

    return next.handle().pipe(
      tap({
        next: (responseData) => {
          const duration = Date.now() - startTime;
          
          // Async audit logging (don't block response)
          setImmediate(() => {
            this.logAuditEntry({
              method,
              path,
              user,
              requestContext,
              body,
              responseData,
              statusCode: response.statusCode,
              duration,
              success: true,
            });
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          
          // Async audit logging for errors
          setImmediate(() => {
            this.logAuditEntry({
              method,
              path,
              user,
              requestContext,
              body,
              error: {
                message: (error as Error).message,
                status: error.status || 500,
              },
              statusCode: error.status || 500,
              duration,
              success: false,
            });
          });
        },
      }),
    );
  }

  /**
   * Log audit entry for the request
   */
  private async logAuditEntry(data: {
    method: string;
    path: string;
    user: any;
    requestContext: any;
    body: any;
    responseData?: any;
    error?: any;
    statusCode: number;
    duration: number;
    success: boolean;
  }): Promise<void> {
    try {
      const {
        method,
        path,
        user,
        requestContext,
        body,
        responseData,
        error,
        statusCode,
        duration,
        success,
      } = data;

      // Determine action based on method and path
      const action = this.determineAction(method, path);
      
      // Extract resource information
      const resourceInfo = this.extractResourceInfo(path, body, responseData);

      await this.auditAdapter.log({
        action,
        tenant_id: requestContext?.tenantId,
        user_id: user?.id,
        resource_type: resourceInfo.type,
        resource_id: resourceInfo.id,
        old_values: method === 'PUT' || method === 'PATCH' ? body : undefined,
        new_values: success ? this.sanitizeResponseData(responseData) : undefined,
        metadata: {
          http_method: method,
          path,
          status_code: statusCode,
          duration_ms: duration,
          success,
          error_message: error?.message,
          user_agent: requestContext?.userAgent,
          correlation_id: requestContext?.correlationId,
        },
        ip_address: requestContext?.ipAddress,
        user_agent: requestContext?.userAgent,
        correlation_id: requestContext?.correlationId,
      });

      this.logger.debug('Audit entry logged', {
        action,
        resourceType: resourceInfo.type,
        resourceId: resourceInfo.id,
        tenantId: requestContext?.tenantId,
        userId: user?.id,
        correlationId: requestContext?.correlationId,
      });
    } catch (error) {
      this.logger.error('Failed to log audit entry', {
        error: (error as Error).message,
        path: data.path,
        method: data.method,
        correlationId: data.requestContext?.correlationId,
      });
    }
  }

  /**
   * Determine audit action from HTTP method and path
   */
  private determineAction(method: string, path: string): string {
    const pathSegments = path.split('/').filter(segment => segment);
    const resource = pathSegments[pathSegments.length - 2] || pathSegments[pathSegments.length - 1];

    const baseResource = resource.replace(/s$/, ''); // Remove plural

    switch (method) {
      case 'POST':
        if (path.includes('/clone')) return `${baseResource}.cloned`;
        if (path.includes('/bulk')) return `${baseResource}.bulk_operation`;
        return `${baseResource}.created`;
      
      case 'GET':
        if (path.includes('/export')) return `${baseResource}.exported`;
        return `${baseResource}.read`;
      
      case 'PUT':
        return `${baseResource}.updated`;
      
      case 'PATCH':
        return `${baseResource}.updated`;
      
      case 'DELETE':
        return `${baseResource}.deleted`;
      
      default:
        return `${baseResource}.accessed`;
    }
  }

  /**
   * Extract resource information from path and data
   */
  private extractResourceInfo(path: string, body: any, responseData: any): {
    type: string;
    id: string;
  } {
    const pathSegments = path.split('/').filter(segment => segment);
    
    // Try to find UUID in path (resource ID)
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const pathId = pathSegments.find(segment => uuidRegex.test(segment));
    
    // Determine resource type from path
    let resourceType = 'unknown';
    if (path.includes('/taxonomy')) resourceType = 'taxonomy';
    else if (path.includes('/category')) resourceType = 'category';
    else if (path.includes('/classification')) resourceType = 'classification';
    else if (path.includes('/namespace')) resourceType = 'namespace';
    else if (path.includes('/tag')) resourceType = 'tag';

    // Get resource ID from path, response data, or body
    const resourceId = pathId || 
                      responseData?.data?.id || 
                      body?.id || 
                      'unknown';

    return {
      type: resourceType,
      id: resourceId,
    };
  }

  /**
   * Check if audit should be skipped for this request
   */
  private shouldSkipAudit(request: Request): boolean {
    const path = request.path;
    const method = request.method;

    // Skip audit for health checks and docs
    if (path.includes('/health') || 
        path.includes('/docs') || 
        path.includes('/metrics') ||
        path === '/') {
      return true;
    }

    // Skip audit for GET requests to list endpoints (too verbose)
    if (method === 'GET' && !this.isDetailEndpoint(path)) {
      return true;
    }

    return false;
  }

  /**
   * Check if this is a detail endpoint (single resource)
   */
  private isDetailEndpoint(path: string): boolean {
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    return uuidRegex.test(path);
  }

  /**
   * Sanitize request body for audit logging
   */
  private sanitizeRequestBody(body: any): any {
    if (!body) return undefined;

    const sanitized = { ...body };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'credential'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Sanitize response data for audit logging
   */
  private sanitizeResponseData(responseData: any): any {
    if (!responseData) return undefined;

    // Only log the main data portion, not metadata
    if (responseData.data) {
      return responseData.data;
    }

    return responseData;
  }
}
