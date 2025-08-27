/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reser            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="deprecated">Deprecated</SelectItem>
            </SelectContent> * 
 * Service: taxonomy
 * Port: 3201
 * Namespace Filters Component - Search and Filter Controls for Namespaces
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Search, Filter, X, SortAsc, SortDesc } from 'lucide-react';

interface NamespaceFiltersProps {
  search: string;
  status: string;
  sort: string;
  order: string;
}

export function NamespaceFilters({ 
  search, 
  status, 
  sort, 
  order 
}: NamespaceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/namespaces?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/namespaces');
  };

  const toggleSortOrder = () => {
    const newOrder = order === 'asc' ? 'desc' : 'asc';
    updateFilters({ order: newOrder });
  };

  const hasActiveFilters = search || status || sort !== 'name' || order !== 'asc';

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="text-sm font-medium mb-2 block">Search Namespaces</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, description..."
              value={search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="text-sm font-medium mb-2 block">Status</label>
          <Select 
            value={status || "all"} 
            onValueChange={(value) => updateFilters({ status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="deprecated">Deprecated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-sm font-medium mb-2 block">Sort By</label>
          <Select 
            value={sort} 
            onValueChange={(value) => updateFilters({ sort: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="created_at">Created Date</SelectItem>
              <SelectItem value="updated_at">Updated Date</SelectItem>
              <SelectItem value="category_count">Category Count</SelectItem>
              <SelectItem value="entity_count">Entity Count</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleSortOrder}
            className="flex-1"
          >
            {order === 'asc' ? (
              <SortAsc className="h-4 w-4 mr-2" />
            ) : (
              <SortDesc className="h-4 w-4 mr-2" />
            )}
            {order === 'asc' ? 'Asc' : 'Desc'}
          </Button>
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Active filters:</span>
            {search && (
              <span className="px-2 py-1 bg-muted rounded">
                Search: "{search}"
              </span>
            )}
            {status && (
              <span className="px-2 py-1 bg-muted rounded">
                Status: {status}
              </span>
            )}
            {sort !== 'name' && (
              <span className="px-2 py-1 bg-muted rounded">
                Sort: {sort}
              </span>
            )}
            {order !== 'asc' && (
              <span className="px-2 py-1 bg-muted rounded">
                Order: {order}
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
