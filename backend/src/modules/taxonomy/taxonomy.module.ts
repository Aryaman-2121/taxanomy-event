/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Taxonomy Module
 * Template: Eventzr Code Repository Template v1.0
 */

import { Module } from '@nestjs/common';
import { TaxonomyController } from './controllers/taxonomy.controller';
import { TaxonomyService } from './services/taxonomy.service';
import { TaxonomyRepository } from './repositories/taxonomy.repository';
import { AdaptersModule } from '../../common/adapters/adapters.module';

@Module({
  imports: [AdaptersModule],
  controllers: [TaxonomyController],
  providers: [TaxonomyService, TaxonomyRepository],
  exports: [TaxonomyService, TaxonomyRepository],
})
export class TaxonomyModule {}
