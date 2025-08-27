/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Category Details Component - Display Category Information
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FolderTree, Edit, Trash2, Eye, Plus } from 'lucide-react';

interface CategoryDetailsProps {
  categoryId: string;
  namespace: string;
  entityType: string;
}

export function CategoryDetails({ categoryId, namespace, entityType }: CategoryDetailsProps) {
  if (!categoryId) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <FolderTree className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Category</h3>
            <p className="text-muted-foreground mb-4">
              Choose a category from the tree to view details and manage its properties.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Category
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock category data - replace with actual API call
  const category = {
    id: categoryId,
    name: 'Music Events',
    display_name: 'Music Events & Concerts',
    description: 'Categories for musical performances, concerts, and music-related events',
    namespace_id: namespace || 'events',
    entity_type: entityType || 'event',
    status: 'active',
    parent_id: null,
    level: 1,
    path: '/music-events',
    is_leaf: false,
    child_count: 5,
    entity_count: 234,
    created_at: '2025-01-15T10:30:00Z',
    updated_at: '2025-08-20T14:22:00Z',
    created_by: 'admin@eventzr.com',
    metadata: {
      color: '#3B82F6',
      icon: 'music',
      external_ids: {
        legacy_id: 'MUS_001',
        source_system: 'old_taxonomy'
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.metadata.color }}
              />
              <div>
                <CardTitle className="text-xl">{category.display_name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {category.path} • Level {category.level}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                {category.status}
              </Badge>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button size="sm" variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{category.description}</p>
        </CardContent>
      </Card>

      {/* Category Properties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{category.name}</span>
              
              <span className="text-muted-foreground">Display Name:</span>
              <span className="font-medium">{category.display_name}</span>
              
              <span className="text-muted-foreground">Namespace:</span>
              <Badge variant="outline">{category.namespace_id}</Badge>
              
              <span className="text-muted-foreground">Entity Type:</span>
              <Badge variant="secondary">{category.entity_type}</Badge>
              
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                {category.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hierarchy & Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Level:</span>
              <span className="font-medium">{category.level}</span>
              
              <span className="text-muted-foreground">Parent:</span>
              <span className="font-medium">
                {category.parent_id ? 'Has Parent' : 'Root Category'}
              </span>
              
              <span className="text-muted-foreground">Children:</span>
              <span className="font-medium">{category.child_count} categories</span>
              
              <span className="text-muted-foreground">Entities:</span>
              <span className="font-medium">{category.entity_count} assigned</span>
              
              <span className="text-muted-foreground">Is Leaf:</span>
              <span className="font-medium">{category.is_leaf ? 'Yes' : 'No'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Metadata & History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Timestamps</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(category.created_at).toLocaleDateString()}</span>
                
                <span className="text-muted-foreground">Updated:</span>
                <span>{new Date(category.updated_at).toLocaleDateString()}</span>
                
                <span className="text-muted-foreground">Created By:</span>
                <span>{category.created_by}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">External References</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Legacy ID:</span>
                <span className="font-mono">{category.metadata.external_ids.legacy_id}</span>
                
                <span className="text-muted-foreground">Source:</span>
                <span>{category.metadata.external_ids.source_system}</span>
                
                <span className="text-muted-foreground">Icon:</span>
                <span>{category.metadata.icon}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
