/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Categories Page - Hierarchical Category Management
 * Template: Eventzr Code Repository Template v1.0
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { CategoryTree } from '@/components/categories/category-tree';
import { CategoryDetails } from '@/components/categories/category-details';
import { CategoryHeader } from '@/components/categories/category-header';
import { CategoryFilters } from '@/components/categories/category-filters';
import { TreeSkeleton, DetailsSkeleton } from '@/components/ui/dashboard-skeleton';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Categories | Taxonomy Management',
  description: 'Manage hierarchical categories and their relationships',
};

interface CategoryPageProps {
  searchParams: {
    namespace?: string;
    entity_type?: string;
    category_id?: string;
    search?: string;
    status?: string;
    depth?: string;
  };
}

export default function CategoryPage({ searchParams }: CategoryPageProps) {
  const namespace = searchParams.namespace || '';
  const entityType = searchParams.entity_type || '';
  const categoryId = searchParams.category_id || '';
  const search = searchParams.search || '';
  const status = searchParams.status || '';
  const maxDepth = Number(searchParams.depth) || 5;

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <CategoryHeader 
        namespace={namespace}
        entityType={entityType}
      />

      {/* Filters */}
      <div className="mb-6">
        <CategoryFilters
          namespace={namespace}
          entityType={entityType}
          search={search}
          status={status}
          maxDepth={maxDepth}
        />
      </div>

      {/* Main Content - Tree View */}
      <div className="grid grid-cols-1 lg:grid-cols-taxonomy-tree gap-6">
        {/* Category Tree Sidebar */}
        <div className="taxonomy-tree-sidebar">
          <Suspense fallback={<TreeSkeleton />}>
            <CategoryTree
              namespace={namespace}
              entityType={entityType}
              selectedCategoryId={categoryId}
              search={search}
              status={status}
              maxDepth={maxDepth}
            />
          </Suspense>
        </div>

        {/* Category Details Main Content */}
        <div className="taxonomy-main-content">
          <Suspense fallback={<DetailsSkeleton />}>
            <CategoryDetails
              categoryId={categoryId}
              namespace={namespace}
              entityType={entityType}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
