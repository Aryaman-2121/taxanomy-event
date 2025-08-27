/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Category Filters Component - Search and Filter Controls
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';

interface CategoryFiltersProps {
  namespace: string;
  entityType: string;
  search: string;
  status: string;
  maxDepth: number;
}

export function CategoryFilters({ 
  namespace, 
  entityType, 
  search, 
  status, 
  maxDepth 
}: CategoryFiltersProps) {
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

    router.push(`/categories?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/categories');
  };

  const hasActiveFilters = search || status || namespace || entityType;

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="text-sm font-medium mb-2 block">Search Categories</label>
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

        {/* Namespace */}
        <div>
          <label className="text-sm font-medium mb-2 block">Namespace</label>
          <Select 
            value={namespace} 
            onValueChange={(value) => updateFilters({ namespace: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All namespaces" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All namespaces</SelectItem>
              <SelectItem value="events">Events</SelectItem>
              <SelectItem value="venues">Venues</SelectItem>
              <SelectItem value="content">Content</SelectItem>
              <SelectItem value="users">Users</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Entity Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Entity Type</label>
          <Select 
            value={entityType} 
            onValueChange={(value) => updateFilters({ entity_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="venue">Venue</SelectItem>
              <SelectItem value="article">Article</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div>
          <label className="text-sm font-medium mb-2 block">Status</label>
          <Select 
            value={status} 
            onValueChange={(value) => updateFilters({ status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="deprecated">Deprecated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
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
          <Button variant="outline" size="sm" className="flex-1">
            <Filter className="h-4 w-4 mr-2" />
            More
          </Button>
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
            {namespace && (
              <span className="px-2 py-1 bg-muted rounded">
                Namespace: {namespace}
              </span>
            )}
            {entityType && (
              <span className="px-2 py-1 bg-muted rounded">
                Type: {entityType}
              </span>
            )}
            {status && (
              <span className="px-2 py-1 bg-muted rounded">
                Status: {status}
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
