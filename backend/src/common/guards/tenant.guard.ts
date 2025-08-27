/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Tenant Guard - Multi-tenant Access Control
 * Template: Eventzr Code Repository Template v1.0
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthAdapter } from '../adapters/auth.adapter';

export const TENANT_OPTIONAL_KEY = 'tenantOptional';
export const TenantOptional = () => SetMetadata(TENANT_OPTIONAL_KEY, true);

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(
    private readonly authAdapter: AuthAdapter,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;
    const requestContext = (request as any).context;

    if (!user || !requestContext) {
      // This should not happen if AuthGuard is working correctly
      throw new ForbiddenException({
        code: 'MISSING_USER_CONTEXT',
        message: 'User context not found',
      });
    }

    const isTenantOptional = this.reflector.getAllAndOverride<boolean>(
      TENANT_OPTIONAL_KEY,
      [context.getHandler(), context.getClass()],
    );

    try {
      // Get tenant ID from headers or user context
      const headerTenantId = request.headers['x-tenant-id'] as string;
      const requestedTenantId = headerTenantId || user.tenantId;

      if (!requestedTenantId && !isTenantOptional) {
        throw new ForbiddenException({
          code: 'MISSING_TENANT_ID',
          message: 'Tenant ID required',
          correlationId: requestContext.correlationId,
        });
      }

      // Validate tenant access if tenant ID is provided
      if (requestedTenantId) {
        const hasAccess = await this.authAdapter.validateTenantAccess(
          requestedTenantId,
          user.id
        );

        if (!hasAccess) {
          throw new ForbiddenException({
            code: 'TENANT_ACCESS_DENIED',
            message: 'Access denied to tenant',
            correlationId: requestContext.correlationId,
          });
        }

        // Update context with validated tenant ID
        requestContext.tenantId = requestedTenantId;
      }

      this.logger.debug('Tenant access validated', {
        userId: user.id,
        tenantId: requestContext.tenantId,
        correlationId: requestContext.correlationId,
      });

      return true;
    } catch (error) {
      this.logger.warn('Tenant access denied', {
        userId: user.id,
        requestedTenantId: request.headers['x-tenant-id'],
        error: (error as Error).message,
        correlationId: requestContext.correlationId,
      });

      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new ForbiddenException({
        code: 'TENANT_VALIDATION_FAILED',
        message: 'Tenant validation failed',
        correlationId: requestContext.correlationId,
      });
    }
  }
}
