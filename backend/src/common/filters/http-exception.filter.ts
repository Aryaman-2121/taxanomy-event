/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * HTTP Exception Filter
 * Template: Eventzr Code Repository Template v1.0
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';

export interface StandardErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    correlationId?: string;
    timestamp: string;
    path: string;
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestContext = (request as any).context;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: StandardErrorResponse;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      errorResponse = {
        success: false,
        error: {
          code: typeof exceptionResponse === 'object' && exceptionResponse['code'] 
                ? exceptionResponse['code'] 
                : exception.constructor.name.replace('Exception', '').toUpperCase(),
          message: typeof exceptionResponse === 'string' 
                   ? exceptionResponse 
                   : exceptionResponse['message'] || exception.message,
          details: typeof exceptionResponse === 'object' ? exceptionResponse['details'] : undefined,
          correlationId: requestContext?.correlationId,
          timestamp: new Date().toISOString(),
          path: request.url,
        },
      };
    } else if (exception instanceof PrismaClientKnownRequestError) {
      status = this.mapPrismaErrorToHttpStatus(exception);
      errorResponse = this.mapPrismaError(exception, request, requestContext);
    } else if (exception instanceof PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      errorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Database validation failed',
          details: exception.message,
          correlationId: requestContext?.correlationId,
          timestamp: new Date().toISOString(),
          path: request.url,
        },
      };
    } else {
      // Unknown error
      errorResponse = {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          correlationId: requestContext?.correlationId,
          timestamp: new Date().toISOString(),
          path: request.url,
        },
      };
    }

    // Log the error
    this.logger.error(`${request.method} ${request.url} - ${status}`, {
      error: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
      correlationId: requestContext?.correlationId,
      tenantId: requestContext?.tenantId,
      userId: requestContext?.userId,
      statusCode: status,
    });

    response.status(status).json(errorResponse);
  }

  /**
   * Map Prisma errors to HTTP status codes
   */
  private mapPrismaErrorToHttpStatus(error: PrismaClientKnownRequestError): number {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return HttpStatus.CONFLICT;
      case 'P2025': // Record not found
        return HttpStatus.NOT_FOUND;
      case 'P2003': // Foreign key constraint violation
        return HttpStatus.BAD_REQUEST;
      case 'P2004': // Constraint violation
        return HttpStatus.BAD_REQUEST;
      case 'P2011': // Null constraint violation
        return HttpStatus.BAD_REQUEST;
      case 'P2012': // Missing required value
        return HttpStatus.BAD_REQUEST;
      case 'P2013': // Missing required argument
        return HttpStatus.BAD_REQUEST;
      case 'P2014': // Invalid ID
        return HttpStatus.BAD_REQUEST;
      case 'P2015': // Record not found
        return HttpStatus.NOT_FOUND;
      case 'P2016': // Query interpretation error
        return HttpStatus.BAD_REQUEST;
      case 'P2017': // Records not connected
        return HttpStatus.BAD_REQUEST;
      case 'P2018': // Required connected records not found
        return HttpStatus.BAD_REQUEST;
      case 'P2019': // Input error
        return HttpStatus.BAD_REQUEST;
      case 'P2020': // Value out of range
        return HttpStatus.BAD_REQUEST;
      case 'P2021': // Table not found
        return HttpStatus.INTERNAL_SERVER_ERROR;
      case 'P2022': // Column not found
        return HttpStatus.INTERNAL_SERVER_ERROR;
      case 'P2023': // Inconsistent column data
        return HttpStatus.BAD_REQUEST;
      case 'P2024': // Connection timeout
        return HttpStatus.REQUEST_TIMEOUT;
      case 'P2030': // Cannot find full-text index
        return HttpStatus.INTERNAL_SERVER_ERROR;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  /**
   * Map Prisma errors to standardized error response
   */
  private mapPrismaError(
    error: PrismaClientKnownRequestError,
    request: Request,
    requestContext: any
  ): StandardErrorResponse {
    let code: string;
    let message: string;
    let details: any;

    switch (error.code) {
      case 'P2002':
        code = 'DUPLICATE_RECORD';
        message = `A record with this ${error.meta?.target} already exists`;
        details = { field: error.meta?.target };
        break;

      case 'P2025':
        code = 'RECORD_NOT_FOUND';
        message = 'The requested record was not found';
        details = { cause: error.meta?.cause };
        break;

      case 'P2003':
        code = 'FOREIGN_KEY_CONSTRAINT';
        message = 'Referenced record does not exist';
        details = { field: error.meta?.field_name };
        break;

      case 'P2011':
        code = 'NULL_CONSTRAINT_VIOLATION';
        message = 'Required field cannot be null';
        details = { constraint: error.meta?.constraint };
        break;

      case 'P2012':
        code = 'MISSING_REQUIRED_VALUE';
        message = 'A required value is missing';
        details = { path: error.meta?.path };
        break;

      case 'P2024':
        code = 'CONNECTION_TIMEOUT';
        message = 'Database connection timeout';
        details = { timeout: error.meta?.timeout };
        break;

      default:
        code = 'DATABASE_ERROR';
        message = 'A database error occurred';
        details = { 
          prismaCode: error.code,
          meta: error.meta,
        };
    }

    return {
      success: false,
      error: {
        code,
        message,
        details,
        correlationId: requestContext?.correlationId,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };
  }
}

