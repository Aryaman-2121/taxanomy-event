/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Category Header Component - Page Header for Categories
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FolderTree, Download, Upload } from 'lucide-react';
import { useTaxonomyStore } from '@/lib/stores/taxonomy-store';

interface CategoryHeaderProps {
  namespace: string;
  entityType: string;
}

export function CategoryHeader({ namespace, entityType }: CategoryHeaderProps) {
  const { openCreateCategory, openBulkOperations } = useTaxonomyStore();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Category Management
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-muted-foreground">
            Hierarchical category structure and relationships
          </p>
          {namespace && (
            <Badge variant="outline">
              <FolderTree className="h-3 w-3 mr-1" />
              {namespace}
            </Badge>
          )}
          {entityType && (
            <Badge variant="secondary">
              {entityType}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={openBulkOperations}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={openBulkOperations}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button onClick={openCreateCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>
    </div>
  );
}
