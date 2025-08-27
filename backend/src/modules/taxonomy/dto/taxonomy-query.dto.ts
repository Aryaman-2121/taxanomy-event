/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Taxonomy Query DTO
 * Template: Eventzr Code Repository Template v1.0
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TaxonomyStatus } from '@prisma/client';

export class TaxonomyQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by namespace',
    example: 'events',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  namespace?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: TaxonomyStatus,
  })
  @IsOptional()
  @IsEnum(TaxonomyStatus)
  status?: TaxonomyStatus;

  @ApiPropertyOptional({
    description: 'Search term for name, description, or slug',
    example: 'event',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by system taxonomies',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isSystem?: boolean;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'created_at',
    enum: ['name', 'namespace', 'status', 'created_at', 'updated_at'],
  })
  @IsOptional()
  @IsString()
  @IsEnum(['name', 'namespace', 'status', 'created_at', 'updated_at'])
  sortBy?: string = 'created_at';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
