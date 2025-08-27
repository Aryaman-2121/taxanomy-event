/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Bulk Operation DTO
 * Template: Eventzr Code Repository Template v1.0
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsArray, IsUUID, IsOptional, IsObject, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export enum BulkOperationType {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  DELETE = 'delete',
  UPDATE_METADATA = 'update_metadata',
  CHANGE_NAMESPACE = 'change_namespace',
}

export class BulkOperationDto {
  @ApiProperty({
    description: 'Type of bulk operation to perform',
    enum: BulkOperationType,
    example: BulkOperationType.ACTIVATE,
  })
  @IsEnum(BulkOperationType)
  operation: BulkOperationType;

  @ApiProperty({
    description: 'Array of taxonomy IDs to operate on',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
    minItems: 1,
    maxItems: 50,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsUUID('4', { each: true })
  taxonomyIds: string[];

  @ApiPropertyOptional({
    description: 'Additional data for the operation',
    example: {
      new_namespace: 'archived',
      metadata_updates: {
        archived_at: '2025-08-26T19:30:00Z',
      },
    },
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}
