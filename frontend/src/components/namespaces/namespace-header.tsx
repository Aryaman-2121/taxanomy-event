/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Namespace Header Component - Page Header for Namespaces
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Layers, Download, Upload, Settings } from 'lucide-react';
import { useTaxonomyStore } from '@/lib/stores/taxonomy-store';

export function NamespaceHeader() {
  const { openCreateNamespace, openBulkOperations } = useTaxonomyStore();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Namespace Management
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-muted-foreground">
            Organize and manage taxonomy namespaces across all entity types
          </p>
          <Badge variant="outline" className="ml-2">
            <Layers className="h-3 w-3 mr-1" />
            All Namespaces
          </Badge>
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
        <Button 
          variant="outline" 
          size="sm"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Button onClick={openCreateNamespace}>
          <Plus className="h-4 w-4 mr-2" />
          Add Namespace
        </Button>
      </div>
    </div>
  );
}
