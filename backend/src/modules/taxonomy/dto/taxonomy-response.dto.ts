/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Taxonomy Response DTO
 * Template: Eventzr Code Repository Template v1.0
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaxonomyStatus } from '@prisma/client';

export class TaxonomyResponseDto {
  @ApiProperty({
    description: 'Taxonomy unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Tenant identifier',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  tenantId: string;

  @ApiProperty({
    description: 'Taxonomy namespace',
    example: 'events',
  })
  namespace: string;

  @ApiProperty({
    description: 'Taxonomy display name',
    example: 'Event Categories',
  })
  name: string;

  @ApiProperty({
    description: 'URL-friendly identifier',
    example: 'event-categories',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Taxonomy description',
    example: 'Hierarchical categorization of event types and formats',
  })
  description?: string;

  @ApiProperty({
    description: 'Taxonomy version',
    example: 1,
  })
  version: number;

  @ApiProperty({
    description: 'Taxonomy status',
    enum: TaxonomyStatus,
  })
  status: TaxonomyStatus;

  @ApiProperty({
    description: 'Whether this is a system-managed taxonomy',
    example: false,
  })
  isSystem: boolean;

  @ApiProperty({
    description: 'Whether taxonomy supports hierarchical structure',
    example: true,
  })
  isHierarchical: boolean;

  @ApiProperty({
    description: 'Maximum depth for hierarchical categories',
    example: 6,
  })
  maxDepth: number;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: {
      color_scheme: 'blue',
      icon: 'calendar',
      category_count: 25,
    },
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-08-26T19:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-08-26T19:30:00Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Creator user identifier',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  createdBy?: string;

  @ApiPropertyOptional({
    description: 'Last updater user identifier',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  updatedBy?: string;
}
