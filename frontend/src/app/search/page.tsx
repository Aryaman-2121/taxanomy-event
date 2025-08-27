/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Search Page - Universal Taxonomy Search
 * Template: Eventzr Code Repository Template v1.0
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { SearchInterface } from '@/components/search/search-interface';
import { SearchResults } from '@/components/search/search-results';
import { SearchFilters } from '@/components/search/search-filters';
import { SearchStats } from '@/components/search/search-stats';
import { SearchSkeleton } from '@/components/ui/dashboard-skeleton';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Search Taxonomies | Taxonomy Management',
  description: 'Search across all namespaces, categories, and classifications',
};

interface SearchPageProps {
  searchParams: {
    q?: string;
    type?: string;
    namespace?: string;
    status?: string;
    limit?: string;
    page?: string;
    sort?: string;
    order?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const type = searchParams.type || 'all';
  const namespace = searchParams.namespace || '';
  const status = searchParams.status || '';
  const limit = Number(searchParams.limit) || 20;
  const page = Number(searchParams.page) || 1;
  const sort = searchParams.sort || 'relevance';
  const order = searchParams.order || 'desc';

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">
          Search Taxonomies
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find categories, classifications, and related entities across all namespaces
        </p>
      </div>

      {/* Search Interface */}
      <div className="mb-6">
        <SearchInterface
          initialQuery={query}
          initialType={type}
          initialNamespace={namespace}
        />
      </div>

      {/* Search Stats */}
      {query && (
        <div className="mb-6">
          <Suspense fallback={<div className="h-16 bg-gray-100 animate-pulse rounded-lg" />}>
            <SearchStats
              query={query}
              type={type}
              namespace={namespace}
              status={status}
            />
          </Suspense>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search Filters Sidebar */}
        <div className="lg:col-span-1">
          <SearchFilters
            query={query}
            type={type}
            namespace={namespace}
            status={status}
            sort={sort}
            order={order}
          />
        </div>

        {/* Search Results Main Content */}
        <div className="lg:col-span-3">
          {query ? (
            <Suspense fallback={<SearchSkeleton />}>
              <SearchResults
                query={query}
                type={type}
                namespace={namespace}
                status={status}
                limit={limit}
                page={page}
                sort={sort}
                order={order}
              />
            </Suspense>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Enter a search query to find taxonomies, categories, and classifications
              </p>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Popular Searches</h3>
                  <ul className="text-sm space-y-1">
                    <li><a href="?q=music+events" className="text-primary hover:underline">Music Events</a></li>
                    <li><a href="?q=venues" className="text-primary hover:underline">Venues</a></li>
                    <li><a href="?q=food+categories" className="text-primary hover:underline">Food Categories</a></li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Recent Updates</h3>
                  <ul className="text-sm space-y-1">
                    <li><a href="?q=updated+today" className="text-primary hover:underline">Updated Today</a></li>
                    <li><a href="?q=new+categories" className="text-primary hover:underline">New Categories</a></li>
                    <li><a href="?q=pending+review" className="text-primary hover:underline">Pending Review</a></li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Browse by Type</h3>
                  <ul className="text-sm space-y-1">
                    <li><a href="?type=categories" className="text-primary hover:underline">All Categories</a></li>
                    <li><a href="?type=namespaces" className="text-primary hover:underline">Namespaces</a></li>
                    <li><a href="?type=tags" className="text-primary hover:underline">Tags</a></li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Help</h3>
                  <ul className="text-sm space-y-1">
                    <li><a href="/help/search-tips" className="text-primary hover:underline">Search Tips</a></li>
                    <li><a href="/help/operators" className="text-primary hover:underline">Search Operators</a></li>
                    <li><a href="/help/api" className="text-primary hover:underline">API Documentation</a></li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
