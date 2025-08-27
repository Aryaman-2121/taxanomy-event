/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Classification Page Client Wrapper
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClassificationFilters } from './classification-filters';
import { ClassificationList } from './classification-list';

interface ClassificationPageClientProps {
  initialData: {
    page: number;
    limit: number;
    entityType: string;
    entityId: string;
    categoryId: string;
    status: string;
    assignedBy: string;
    confidenceMin: number;
    confidenceMax: number;
    sort: string;
    order: string;
  };
  totalCount: number;
  filteredCount: number;
}

export function ClassificationPageClient({ 
  initialData, 
  totalCount, 
  filteredCount 
}: ClassificationPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialData.status || 'all');
  const [sortBy, setSortBy] = useState(initialData.sort || 'created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>((initialData.order as 'asc' | 'desc') || 'desc');
  const [namespaceFilter, setNamespaceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Check if filters are active
  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || namespaceFilter !== 'all' || typeFilter !== 'all';

  // Update URL with new params
  const updateUrl = useCallback((newParams: Record<string, string>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === '' || value === 'all') {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });

    const search = current.toString();
    const query = search ? `?${search}` : '';
    
    router.push(`/classifications${query}`);
  }, [router, searchParams]);

  // Handler functions
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    updateUrl({ search: query, page: '1' });
  }, [updateUrl]);

  const handleStatusChange = useCallback((status: string) => {
    setStatusFilter(status);
    updateUrl({ status: status === 'all' ? '' : status, page: '1' });
  }, [updateUrl]);

  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort);
    updateUrl({ sort, page: '1' });
  }, [updateUrl]);

  const handleSortOrderChange = useCallback((order: 'asc' | 'desc') => {
    setSortOrder(order);
    updateUrl({ order, page: '1' });
  }, [updateUrl]);

  const handleNamespaceChange = useCallback((namespace: string) => {
    setNamespaceFilter(namespace);
    updateUrl({ namespace: namespace === 'all' ? '' : namespace, page: '1' });
  }, [updateUrl]);

  const handleTypeChange = useCallback((type: string) => {
    setTypeFilter(type);
    updateUrl({ type: type === 'all' ? '' : type, page: '1' });
  }, [updateUrl]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setNamespaceFilter('all');
    setTypeFilter('all');
    router.push('/classifications');
  }, [router]);

  // Mock data - in real app, this would come from API call
  const mockClassifications = [
    {
      id: '1',
      name: 'Event Categories Auto-Classification',
      description: 'Automatically classifies events into appropriate categories based on content analysis',
      namespace: 'events',
      type: 'ai-assisted' as const,
      status: 'active' as const,
      entityCount: 5623,
      accuracy: 87.3,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-08-27T14:30:00Z'
    },
    {
      id: '2', 
      name: 'Venue Type Classification',
      description: 'Rule-based classification for venue types and capabilities',
      namespace: 'venues',
      type: 'rule-based' as const,
      status: 'active' as const,
      entityCount: 2341,
      accuracy: 94.7,
      createdAt: '2024-02-01T09:00:00Z',
      updatedAt: '2024-08-26T16:45:00Z'
    }
  ];

  return (
    <>
      {/* Filters */}
      <div className="mb-6">
        <ClassificationFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          sortOrder={sortOrder}
          onSortOrderChange={handleSortOrderChange}
          namespaceFilter={namespaceFilter}
          onNamespaceChange={handleNamespaceChange}
          typeFilter={typeFilter}
          onTypeChange={handleTypeChange}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Classification List */}
      <ClassificationList
        classifications={mockClassifications}
        isLoading={false}
      />
    </>
  );
}
