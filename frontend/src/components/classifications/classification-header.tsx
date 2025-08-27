/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Classification Header Component - Header for Classification Management
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Download, Upload, Settings, RefreshCw } from 'lucide-react';

interface ClassificationHeaderProps {
  totalCount: number;
  filteredCount: number;
  isLoading?: boolean;
}

export function ClassificationHeader({ 
  totalCount, 
  filteredCount, 
  isLoading = false 
}: ClassificationHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Classifications</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Manage taxonomy classifications and their relationships</span>
          <Badge variant="secondary">
            {isLoading ? '...' : `${filteredCount} of ${totalCount}`}
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Classification
        </Button>
      </div>
    </div>
  );
}
