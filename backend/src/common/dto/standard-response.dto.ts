/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Standard Response DTO
 * Template: Eventzr Code Repository Template v1.0
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StandardResponseDto<T = any> {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Response data',
  })
  data?: T;

  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: {
      timestamp: '2025-08-26T19:30:00Z',
      version: '1.0.0',
    },
  })
  metadata?: Record<string, any>;
}
