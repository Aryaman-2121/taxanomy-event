/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Search Results Component - Display Search Results
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FolderTree, 
  Tags, 
  Layers, 
  ExternalLink,
  ChevronRight 
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface SearchResultsProps {
  query: string;
  type: string;
  namespace: string;
  status: string;
  limit: number;
  page: number;
  sort: string;
  order: string;
}

export function SearchResults({
  query,
  type,
  namespace,
  status,
  limit,
  page,
  sort,
  order
}: SearchResultsProps) {
  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query, type, namespace, status, limit, page, sort, order],
    queryFn: async () => {
      // Mock search results
      const mockResults = [
        {
          id: 'cat_001',
          type: 'category',
          title: 'Music Events',
          description: 'Categories for musical performances, concerts, and music-related events',
          namespace: 'events',
          status: 'active',
          path: '/events/music-events',
          entity_count: 234,
          updated_at: '2025-08-20T14:22:00Z',
          relevance_score: 0.95
        },
        {
          id: 'ns_001',
          type: 'namespace',
          title: 'Events & Activities',
          description: 'Root namespace for all event-related categories',
          namespace: 'events',
          status: 'active',
          path: '/events',
          entity_count: 2340,
          updated_at: '2025-08-19T11:45:00Z',
          relevance_score: 0.88
        },
        {
          id: 'cat_002',
          type: 'category',
          title: 'Concert Venues',
          description: 'Venues specifically designed for musical performances',
          namespace: 'venues',
          status: 'active',
          path: '/venues/concert-venues',
          entity_count: 89,
          updated_at: '2025-08-18T16:30:00Z',
          relevance_score: 0.76
        }
      ];

      // Filter by type
      let filtered = mockResults;
      if (type !== 'all') {
        filtered = filtered.filter(item => item.type === type);
      }

      // Apply other filters
      if (namespace) {
        filtered = filtered.filter(item => item.namespace === namespace);
      }
      if (status) {
        filtered = filtered.filter(item => item.status === status);
      }

      // Sort by relevance or other criteria
      filtered.sort((a, b) => {
        if (sort === 'relevance') {
          return order === 'desc' ? b.relevance_score - a.relevance_score : a.relevance_score - b.relevance_score;
        }
        return 0;
      });

      return {
        data: filtered.slice((page - 1) * limit, page * limit),
        total: filtered.length,
        page,
        limit,
        query,
        took: 45 // milliseconds
      };
    },
    enabled: !!query
  });

  if (!query) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'namespace':
        return <Layers className="h-4 w-4" />;
      case 'category':
        return <FolderTree className="h-4 w-4" />;
      case 'classification':
        return <Tags className="h-4 w-4" />;
      default:
        return <FolderTree className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'namespace':
        return 'bg-blue-100 text-blue-800';
      case 'category':
        return 'bg-green-100 text-green-800';
      case 'classification':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Found {results?.total || 0} results for "{query}" in {results?.took || 0}ms
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results?.data.map((result: any) => (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={getTypeColor(result.type)}>
                      {getTypeIcon(result.type)}
                      <span className="ml-1 capitalize">{result.type}</span>
                    </Badge>
                    <Badge variant="secondary">{result.namespace}</Badge>
                    <Badge 
                      variant={result.status === 'active' ? 'default' : 'secondary'}
                    >
                      {result.status}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-1">
                    {result.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-3">
                    {result.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Path: {result.path}</span>
                    <span>•</span>
                    <span>{result.entity_count} entities</span>
                    <span>•</span>
                    <span>Updated {formatDate(result.updated_at)}</span>
                    <span>•</span>
                    <span>Relevance: {Math.round(result.relevance_score * 100)}%</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    View Details
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {results && results.total > results.limit && (
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1}>
              Previous
            </Button>
            <span className="px-3 py-1 text-sm">
              Page {page} of {Math.ceil(results.total / results.limit)}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page >= Math.ceil(results.total / results.limit)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* No Results */}
      {results?.total === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search query or filters to find what you're looking for.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Suggestions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your spelling</li>
                <li>Use more general terms</li>
                <li>Try different keywords</li>
                <li>Remove some filters</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
