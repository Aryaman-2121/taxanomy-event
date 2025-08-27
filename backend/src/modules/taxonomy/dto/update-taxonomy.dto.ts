/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Update Taxonomy DTO
 * Template: Eventzr Code Repository Template v1.0
 */

import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { CreateTaxonomyDto } from './create-taxonomy.dto';

export class UpdateTaxonomyDto extends PartialType(CreateTaxonomyDto) {
  @ApiPropertyOptional({
    description: 'Taxonomy version (auto-incremented on structural changes)',
    example: 2,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;
}
