/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Category Tree Component - Hierarchical Tree View
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { taxonomyApi, Category } from '@/lib/api/taxonomy-client';
import { useTaxonomyStore } from '@/lib/stores/taxonomy-store';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronRight,
  FolderTree,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
} from 'lucide-react';

interface CategoryTreeProps {
  namespace: string;
  entityType: string;
  selectedCategoryId?: string;
  search?: string;
  status?: string;
  maxDepth?: number;
}

interface TreeNodeProps {
  category: Category;
  level: number;
  isSelected: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  onSelect: (categoryId: string) => void;
  onToggle: (categoryId: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  category,
  level,
  isSelected,
  isExpanded,
  hasChildren,
  onSelect,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(category.id);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggle(category.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(category);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(category.id);
  };

  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    deprecated: 'bg-orange-100 text-orange-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  return (
    <div>
      <div
        className={cn(
          'taxonomy-tree-node group',
          'flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer transition-colors',
          'hover:bg-accent/50',
          isSelected && 'bg-accent text-accent-foreground'
        )}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={handleClick}
      >
        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0"
          onClick={handleToggle}
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )
          ) : (
            <div className="h-3 w-3" />
          )}
        </Button>

        {/* Category Icon */}
        <FolderTree className="h-4 w-4 text-muted-foreground" />

        {/* Category Name */}
        <span className="flex-1 truncate text-sm font-medium">
          {category.display_name}
        </span>

        {/* Status Badge */}
        <Badge
          variant="secondary"
          className={cn('text-xs', statusColors[category.status])}
        >
          {category.status}
        </Badge>

        {/* Action Buttons (visible on hover) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleEdit}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {isExpanded && category.children && (
        <div>
          {category.children.map((child) => (
            <TreeNodeContainer
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeNodeContainer: React.FC<{
  category: Category;
  level: number;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}> = ({ category, level, onEdit, onDelete }) => {
  const {
    ui: { selectedCategoryId, expandedCategoryIds },
    setSelectedCategory,
    toggleCategoryExpanded,
  } = useTaxonomyStore();

  const isSelected = selectedCategoryId === category.id;
  const isExpanded = expandedCategoryIds.has(category.id);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <TreeNode
      category={category}
      level={level}
      isSelected={isSelected}
      isExpanded={isExpanded}
      hasChildren={hasChildren}
      onSelect={setSelectedCategory}
      onToggle={toggleCategoryExpanded}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export function CategoryTree({
  namespace,
  entityType,
  search = '',
  status = '',
  maxDepth = 5,
}: CategoryTreeProps) {
  const [localSearch, setLocalSearch] = React.useState(search);
  const [showFilters, setShowFilters] = React.useState(false);
  const { setEditingCategory, openConfirmDelete } = useTaxonomyStore();

  // Fetch category tree
  const { data, isLoading, error } = useQuery({
    queryKey: ['category-tree', namespace, entityType, search, status, maxDepth],
    queryFn: () => {
      if (!namespace || !entityType) {
        return Promise.resolve({ success: true, data: [] });
      }
      return taxonomyApi.getCategoryTree(namespace, entityType, undefined, maxDepth);
    },
    enabled: Boolean(namespace && entityType),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSearch = React.useCallback(
    (query: string) => {
      setLocalSearch(query);
      // Debounce search - implement if needed
    },
    []
  );

  const handleEdit = React.useCallback(
    (category: Category) => {
      setEditingCategory(category);
    },
    [setEditingCategory]
  );

  const handleDelete = React.useCallback(
    (categoryId: string) => {
      openConfirmDelete('category', categoryId);
    },
    [openConfirmDelete]
  );

  if (!namespace || !entityType) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <FolderTree className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Select a namespace and entity type to view categories
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-8 bg-gray-100 animate-pulse rounded"
                style={{ marginLeft: `${(i % 3) * 20}px` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-2">Failed to load categories</p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categories = data?.data || [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Categories
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="deprecated">Deprecated</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Max Depth</label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option value="3">3 levels</option>
                  <option value="5">5 levels</option>
                  <option value="10">10 levels</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[600px] custom-scrollbar">
          {categories.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FolderTree className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No categories found</p>
                <Button variant="outline" size="sm" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Category
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4">
              {categories.map((category) => (
                <TreeNodeContainer
                  key={category.id}
                  category={category}
                  level={0}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

