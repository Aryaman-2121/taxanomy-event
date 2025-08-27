/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Logging Interceptor
 * Template: Eventzr Code Repository Template v1.0
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();
    const requestContext = (request as any).context;

    const { method, url, headers, body } = request;
    const userAgent = headers['user-agent'];
    const startTime = Date.now();

    // Log request
    this.logger.log(`→ ${method} ${url}`, {
      method,
      url,
      userAgent,
      correlationId: requestContext?.correlationId,
      tenantId: requestContext?.tenantId,
      userId: requestContext?.userId,
      bodySize: body ? JSON.stringify(body).length : 0,
    });

    return next.handle().pipe(
      tap({
        next: (responseData) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          this.logger.log(`← ${method} ${url} ${statusCode} ${duration}ms`, {
            method,
            url,
            statusCode,
            duration,
            correlationId: requestContext?.correlationId,
            tenantId: requestContext?.tenantId,
            responseSize: responseData ? JSON.stringify(responseData).length : 0,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          this.logger.error(`← ${method} ${url} ${statusCode} ${duration}ms - ${(error as Error).message}`, {
            method,
            url,
            statusCode,
            duration,
            error: (error as Error).message,
            correlationId: requestContext?.correlationId,
            tenantId: requestContext?.tenantId,
          });
        },
      }),
    );
  }
}
