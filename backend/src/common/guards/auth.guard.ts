/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Authentication Guard - Golden Rule #1
 * Template: Eventzr Code Repository Template v1.0
 */

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthAdapter, AuthUser } from '../adapters/auth.adapter';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly authAdapter: AuthAdapter,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    
    try {
      const token = this.extractTokenFromHeader(request);
      
      if (!token) {
        throw new UnauthorizedException({
          code: 'MISSING_TOKEN',
          message: 'Authentication token required',
        });
      }

      // Validate token via auth service (Golden Rule #1)
      const user = await this.authAdapter.validateToken(token);
      
      // Attach user and context to request
      (request as any).user = user;
      (request as any).context = {
        userId: user.id,
        tenantId: user.tenantId,
        correlationId: this.generateCorrelationId(),
        timestamp: new Date(),
        userAgent: request.get('user-agent'),
        ipAddress: this.getClientIp(request),
      };

      this.logger.debug('User authenticated', {
        userId: user.id,
        tenantId: user.tenantId,
        correlationId: (request as any).context.correlationId,
      });

      return true;
    } catch (error) {
      this.logger.warn('Authentication failed', {
        error: (error as Error).message,
        path: request.path,
        method: request.method,
        ip: this.getClientIp(request),
      });

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException({
        code: 'AUTHENTICATION_FAILED',
        message: 'Invalid authentication credentials',
      });
    }
  }

  /**
   * Extract JWT token from Authorization header
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  /**
   * Generate correlation ID for request tracing
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get client IP address
   */
  private getClientIp(request: Request): string {
    return (
      request.headers['x-forwarded-for'] as string ||
      request.headers['x-real-ip'] as string ||
      request.connection.remoteAddress ||
      'unknown'
    );
  }
}

