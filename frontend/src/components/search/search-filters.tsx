/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Search Filters Component - Filter Controls for Search
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Filter, X, RefreshCw } from 'lucide-react';

interface SearchFiltersProps {
  query: string;
  type: string;
  namespace: string;
  status: string;
  sort: string;
  order: string;
}

export function SearchFilters({
  query,
  type,
  namespace,
  status,
  sort,
  order
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('type');
    params.delete('namespace');
    params.delete('status');
    params.delete('sort');
    params.delete('order');
    router.push(`/search?${params.toString()}`);
  };

  const hasActiveFilters = type !== 'all' || namespace || status || sort !== 'relevance' || order !== 'desc';

  // Mock data for filters
  const typeOptions = [
    { value: 'all', label: 'All Types', count: 1205 },
    { value: 'namespace', label: 'Namespaces', count: 12 },
    { value: 'category', label: 'Categories', count: 1156 },
    { value: 'classification', label: 'Classifications', count: 37 }
  ];

  const namespaceOptions = [
    { value: '', label: 'All Namespaces', count: 1205 },
    { value: 'events', label: 'Events', count: 567 },
    { value: 'venues', label: 'Venues', count: 234 },
    { value: 'content', label: 'Content', count: 189 },
    { value: 'users', label: 'Users', count: 215 }
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses', count: 1205 },
    { value: 'active', label: 'Active', count: 1089 },
    { value: 'draft', label: 'Draft', count: 67 },
    { value: 'deprecated', label: 'Deprecated', count: 49 }
  ];

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Type Filter */}
        <div>
          <h4 className="font-medium mb-3">Type</h4>
          <div className="space-y-2">
            {typeOptions.map((option) => (
              <div key={option.value} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`type-${option.value}`}
                    checked={type === option.value}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilters({ type: option.value });
                      }
                    }}
                  />
                  <label 
                    htmlFor={`type-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {option.count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Namespace Filter */}
        <div>
          <h4 className="font-medium mb-3">Namespace</h4>
          <div className="space-y-2">
            {namespaceOptions.map((option) => (
              <div key={option.value || 'all'} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`namespace-${option.value || 'all'}`}
                    checked={namespace === option.value}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilters({ namespace: option.value });
                      }
                    }}
                  />
                  <label 
                    htmlFor={`namespace-${option.value || 'all'}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {option.count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Status Filter */}
        <div>
          <h4 className="font-medium mb-3">Status</h4>
          <div className="space-y-2">
            {statusOptions.map((option) => (
              <div key={option.value || 'all'} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`status-${option.value || 'all'}`}
                    checked={status === option.value}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilters({ status: option.value });
                      }
                    }}
                  />
                  <label 
                    htmlFor={`status-${option.value || 'all'}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {option.count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Sort Options */}
        <div>
          <h4 className="font-medium mb-3">Sort By</h4>
          <Select 
            value={sort} 
            onValueChange={(value) => updateFilters({ sort: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="updated_at">Last Updated</SelectItem>
              <SelectItem value="created_at">Created Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="entity_count">Entity Count</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Order Options */}
        <div>
          <h4 className="font-medium mb-3">Order</h4>
          <Select 
            value={order} 
            onValueChange={(value) => updateFilters({ order: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium mb-3">Active Filters</h4>
              <div className="space-y-2">
                {type !== 'all' && (
                  <Badge variant="outline" className="mr-2">
                    Type: {type}
                    <button 
                      onClick={() => updateFilters({ type: 'all' })}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {namespace && (
                  <Badge variant="outline" className="mr-2">
                    Namespace: {namespace}
                    <button 
                      onClick={() => updateFilters({ namespace: '' })}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {status && (
                  <Badge variant="outline" className="mr-2">
                    Status: {status}
                    <button 
                      onClick={() => updateFilters({ status: '' })}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}

        {/* Refresh Button */}
        <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Results
        </Button>
      </CardContent>
    </Card>
  );
}
