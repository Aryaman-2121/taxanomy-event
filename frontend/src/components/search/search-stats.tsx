/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Search Stats Component - Display Search Result Statistics
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  FileText, 
  Tag, 
  Layers, 
  Target,
  Clock,
  TrendingUp,
  BarChart3,
  Filter
} from 'lucide-react';

interface SearchStatsProps {
  query: string;
  type: string;
  namespace: string;
  status: string;
}

interface SearchStat {
  type: string;
  label: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function SearchStats({ query, type, namespace, status }: SearchStatsProps) {
  // Mock search statistics - in real app, this would come from API
  const totalResults = 1247;
  const searchTime = 0.043;
  
  const typeStats: SearchStat[] = [
    {
      type: 'categories',
      label: 'Categories',
      count: 856,
      icon: FileText,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      type: 'namespaces',
      label: 'Namespaces',
      count: 12,
      icon: Layers,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      type: 'classifications',
      label: 'Classifications',
      count: 234,
      icon: Target,
      color: 'bg-green-100 text-green-800'
    },
    {
      type: 'tags',
      label: 'Tags',
      count: 145,
      icon: Tag,
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  const namespaceStats = [
    { name: 'events', count: 567, percentage: 45.5 },
    { name: 'venues', count: 234, percentage: 18.8 },
    { name: 'content', count: 189, percentage: 15.1 },
    { name: 'users', count: 156, percentage: 12.5 },
    { name: 'other', count: 101, percentage: 8.1 }
  ];

  const statusStats = [
    { name: 'active', count: 1089, percentage: 87.3, color: 'bg-green-500' },
    { name: 'draft', count: 98, percentage: 7.9, color: 'bg-yellow-500' },
    { name: 'deprecated', count: 60, percentage: 4.8, color: 'bg-red-500' }
  ];

  return (
    <div className="space-y-4">
      {/* Main Search Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-semibold">
                  {totalResults.toLocaleString()} results for "{query}"
                </div>
                <div className="text-sm text-muted-foreground">
                  Search completed in {searchTime}s
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Just now
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Type Distribution */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4" />
            <h3 className="font-semibold">Results by Type</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {typeStats.map((stat) => {
              const Icon = stat.icon;
              const isSelected = type === stat.type;
              return (
                <div
                  key={stat.type}
                  className={`p-3 rounded-lg border transition-colors ${
                    isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-bold">{stat.count.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {((stat.count / totalResults) * 100).toFixed(1)}% of results
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Namespace and Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Namespace Distribution */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-4 w-4" />
              <h3 className="font-semibold">By Namespace</h3>
            </div>
            <div className="space-y-3">
              {namespaceStats.map((ns) => (
                <div key={ns.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={namespace === ns.name ? "default" : "outline"} 
                        className="text-xs"
                      >
                        {ns.name}
                      </Badge>
                    </div>
                    <span className="font-medium">{ns.count}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${ns.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {ns.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4" />
              <h3 className="font-semibold">By Status</h3>
            </div>
            <div className="space-y-3">
              {statusStats.map((stat) => (
                <div key={stat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                      <span className="capitalize font-medium">{stat.name}</span>
                    </div>
                    <span className="font-medium">{stat.count}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${stat.color}`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {stat.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applied Filters Summary */}
      {(type !== 'all' || namespace || status) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4" />
              <h3 className="font-semibold">Applied Filters</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {type !== 'all' && (
                <Badge variant="secondary">
                  Type: {type}
                </Badge>
              )}
              {namespace && (
                <Badge variant="secondary">
                  Namespace: {namespace}
                </Badge>
              )}
              {status && (
                <Badge variant="secondary">
                  Status: {status}
                </Badge>
              )}
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {((typeStats.find(s => s.type === type)?.count || totalResults) / totalResults * 100).toFixed(1)}% 
              of total results match your filters
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Refine your search or export results
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Refine Search
              </Button>
              <Button variant="outline" size="sm">
                Export Results
              </Button>
              <Button variant="outline" size="sm">
                Save Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
