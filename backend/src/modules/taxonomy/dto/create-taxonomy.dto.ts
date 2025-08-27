/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Create Taxonomy DTO
 * Template: Eventzr Code Repository Template v1.0
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsObject,
  Length,
  Matches,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TaxonomyStatus } from '@prisma/client';

export class CreateTaxonomyDto {
  @ApiProperty({
    description: 'Taxonomy namespace for logical grouping',
    example: 'events',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  @Matches(/^[a-z][a-z0-9-_]*[a-z0-9]$/, {
    message: 'Namespace must be lowercase alphanumeric with hyphens/underscores',
  })
  namespace: string;

  @ApiProperty({
    description: 'Taxonomy display name',
    example: 'Event Categories',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @Length(2, 200)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'URL-friendly identifier',
    example: 'event-categories',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @Length(2, 200)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Taxonomy description',
    example: 'Hierarchical categorization of event types and formats',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({
    description: 'Taxonomy status',
    enum: TaxonomyStatus,
    default: TaxonomyStatus.draft,
  })
  @IsOptional()
  @IsEnum(TaxonomyStatus)
  status?: TaxonomyStatus;

  @ApiPropertyOptional({
    description: 'Whether taxonomy supports hierarchical structure',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isHierarchical?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum depth for hierarchical categories',
    example: 6,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxDepth?: number;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: {
      color_scheme: 'blue',
      icon: 'calendar',
      ai_enhanced: true,
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
