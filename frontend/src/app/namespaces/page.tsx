/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Namespaces Page - List and Manage Namespaces
 * Template: Eventzr Code Repository Template v1.0
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { NamespaceList } from '@/components/namespaces/namespace-list';
import { NamespaceHeader } from '@/components/namespaces/namespace-header';
import { NamespaceFilters } from '@/components/namespaces/namespace-filters';
import { DataTableSkeleton } from '@/components/ui/dashboard-skeleton';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Namespaces | Taxonomy Management',
  description: 'Manage and organize your taxonomy namespaces',
};

interface NamespacePageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    sort?: string;
    order?: string;
  };
}

export default function NamespacePage({ searchParams }: NamespacePageProps) {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const search = searchParams.search || '';
  const status = (searchParams.status as 'all' | 'active' | 'inactive' | 'deprecated') || 'all';
  const sort = searchParams.sort || 'name';
  const order = searchParams.order || 'asc';

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <NamespaceHeader />

      {/* Filters */}
      <div className="mb-6">
        <NamespaceFilters
          search={search}
          status={status}
          sort={sort}
          order={order}
        />
      </div>

      {/* Namespace List */}
      <Suspense fallback={<DataTableSkeleton columns={5} rows={10} />}>
        <NamespaceList
          page={page}
          limit={limit}
          search={search}
          status={status}
          sort={sort}
          order={order}
        />
      </Suspense>
    </div>
  );
}
