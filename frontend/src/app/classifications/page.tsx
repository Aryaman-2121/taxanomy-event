/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Classifications Page - Entity-Category Assignments
 * Template: Eventzr Code Repository Template v1.0
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { ClassificationHeader } from '@/components/classifications/classification-header';
import { ClassificationStats } from '@/components/classifications/classification-stats';
import { ClassificationPageClient } from '@/components/classifications/classification-page-client';
import { DataTableSkeleton } from '@/components/ui/dashboard-skeleton';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Classifications | Taxonomy Management',
  description: 'Manage entity-category assignments and their statuses',
};

interface ClassificationPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    entity_type?: string;
    entity_id?: string;
    category_id?: string;
    status?: string;
    assigned_by?: string;
    confidence_min?: string;
    confidence_max?: string;
    sort?: string;
    order?: string;
  };
}

export default function ClassificationPage({ searchParams }: ClassificationPageProps) {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const entityType = searchParams.entity_type || '';
  const entityId = searchParams.entity_id || '';
  const categoryId = searchParams.category_id || '';
  const status = searchParams.status || '';
  const assignedBy = searchParams.assigned_by || '';
  const confidenceMin = Number(searchParams.confidence_min) || 0;
  const confidenceMax = Number(searchParams.confidence_max) || 100;
  const sort = searchParams.sort || 'created_at';
  const order = searchParams.order || 'desc';

  // Mock data - in real app, this would come from API call
  const totalCount = 12847;
  const filteredCount = 8234;

  const initialData = {
    page,
    limit,
    entityType,
    entityId,
    categoryId,
    status,
    assignedBy,
    confidenceMin,
    confidenceMax,
    sort,
    order
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <ClassificationHeader 
        totalCount={totalCount}
        filteredCount={filteredCount}
      />

      {/* Stats Overview */}
      <div className="mb-6">
        <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-lg" />}>
          <ClassificationStats
            entityType={entityType}
            status={status}
            assignedBy={assignedBy}
          />
        </Suspense>
      </div>

      {/* Client-side filters and list */}
      <Suspense fallback={<DataTableSkeleton columns={8} rows={15} />}>
        <ClassificationPageClient
          initialData={initialData}
          totalCount={totalCount}
          filteredCount={filteredCount}
        />
      </Suspense>
    </div>
  );
}
