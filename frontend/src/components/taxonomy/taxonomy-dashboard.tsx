/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Taxonomy Dashboard - Main Overview Component
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { taxonomyApi } from '@/lib/api/taxonomy-client';
import { useTaxonomyStore } from '@/lib/stores/taxonomy-store';
import {
  BarChart3,
  FolderTree,
  Tags,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Layers,
  Activity,
} from 'lucide-react';

interface DashboardStats {
  namespaces: {
    total: number;
    active: number;
    growth: number;
  };
  categories: {
    total: number;
    byStatus: Record<string, number>;
    growth: number;
  };
  classifications: {
    total: number;
    byStatus: Record<string, number>;
    growth: number;
  };
  usage: {
    apiCalls: number;
    uniqueUsers: number;
    topNamespaces: Array<{
      id: string;
      name: string;
      usage: number;
    }>;
  };
}

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
  color?: 'blue' | 'green' | 'orange' | 'red';
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-md ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
          {trend !== undefined && (
            <span className={`ml-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}
              {trend}%
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
};

const RecentActivityCard = () => {
  const { data: recentCategories } = useQuery({
    queryKey: ['categories', 'recent'],
    queryFn: () =>
      taxonomyApi.getCategories(1, 10, {
        sort: 'created_at',
        order: 'desc',
      }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest taxonomy updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentCategories?.data.slice(0, 5).map((category) => (
          <div key={category.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <FolderTree className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">{category.display_name}</p>
                <p className="text-xs text-muted-foreground">
                  {category.entity_type} • {category.namespace_id}
                </p>
              </div>
            </div>
            <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
              {category.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const QuickActionsCard = () => {
  const {
    openCreateNamespace,
    openCreateCategory,
    openCreateClassification,
    openBulkOperations,
  } = useTaxonomyStore();

  const actions = [
    {
      title: 'Create Namespace',
      description: 'Add a new taxonomy namespace',
      icon: Layers,
      onClick: openCreateNamespace,
      color: 'bg-blue-500',
    },
    {
      title: 'Create Category',
      description: 'Add a new category',
      icon: FolderTree,
      onClick: openCreateCategory,
      color: 'bg-green-500',
    },
    {
      title: 'Create Classification',
      description: 'Assign categories to entities',
      icon: Tags,
      onClick: openCreateClassification,
      color: 'bg-orange-500',
    },
    {
      title: 'Bulk Operations',
      description: 'Import/export taxonomies',
      icon: Upload,
      onClick: openBulkOperations,
      color: 'bg-purple-500',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common taxonomy management tasks</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <Button
            key={action.title}
            variant="outline"
            className="h-auto flex-col items-start p-4"
            onClick={action.onClick}
          >
            <div className={`mb-2 rounded-md p-2 ${action.color}`}>
              <action.icon className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium">{action.title}</div>
              <div className="text-xs text-muted-foreground">
                {action.description}
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

const UsageChart = () => {
  // Mock data - replace with real API call
  const data = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 900 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Usage Trends
        </CardTitle>
        <CardDescription>API calls and classification activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          {/* Replace with actual chart component like Recharts */}
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chart visualization would go here</p>
            <p className="text-sm">Replace with Recharts component</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function TaxonomyDashboard() {
  const { stats, updateStats } = useTaxonomyStore();

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Mock implementation - replace with actual API calls
      const stats: DashboardStats = {
        namespaces: { total: 12, active: 10, growth: 8.3 },
        categories: {
          total: 1247,
          byStatus: { active: 1124, draft: 89, deprecated: 34 },
          growth: 12.5,
        },
        classifications: {
          total: 8532,
          byStatus: { confirmed: 7234, pending: 956, rejected: 342 },
          growth: 15.7,
        },
        usage: {
          apiCalls: 45200,
          uniqueUsers: 234,
          topNamespaces: [
            { id: '1', name: 'events', usage: 15600 },
            { id: '2', name: 'venues', usage: 12400 },
            { id: '3', name: 'content', usage: 8900 },
          ],
        },
      };
      return stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  React.useEffect(() => {
    if (dashboardStats) {
      updateStats({
        totalNamespaces: dashboardStats.namespaces.total,
        totalCategories: dashboardStats.categories.total,
        totalClassifications: dashboardStats.classifications.total,
        monthlyGrowth: {
          namespaces: dashboardStats.namespaces.growth,
          categories: dashboardStats.categories.growth,
          classifications: dashboardStats.classifications.growth,
        },
      });
    }
  }, [dashboardStats, updateStats]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
          <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Namespaces"
          value={dashboardStats?.namespaces.active || 0}
          description={`${dashboardStats?.namespaces.total || 0} total`}
          icon={Layers}
          trend={dashboardStats?.namespaces.growth}
          color="blue"
        />
        <StatCard
          title="Total Categories"
          value={dashboardStats?.categories.total.toLocaleString() || '0'}
          description="Across all namespaces"
          icon={FolderTree}
          trend={dashboardStats?.categories.growth}
          color="green"
        />
        <StatCard
          title="Active Classifications"
          value={dashboardStats?.classifications.total.toLocaleString() || '0'}
          description="Entity assignments"
          icon={Tags}
          trend={dashboardStats?.classifications.growth}
          color="orange"
        />
        <StatCard
          title="Monthly API Calls"
          value={dashboardStats?.usage.apiCalls.toLocaleString() || '0'}
          description={`${dashboardStats?.usage.uniqueUsers || 0} unique users`}
          icon={TrendingUp}
          color="red"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickActionsCard />
            <RecentActivityCard />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Category Status</CardTitle>
                <CardDescription>Distribution by status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardStats?.categories.byStatus &&
                  Object.entries(dashboardStats.categories.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                          {status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count}</span>
                        <Progress 
                          value={(count / dashboardStats.categories.total) * 100} 
                          className="w-16" 
                        />
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Classification Status */}
            <Card>
              <CardHeader>
                <CardTitle>Classification Status</CardTitle>
                <CardDescription>Assignment status distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardStats?.classifications.byStatus &&
                  Object.entries(dashboardStats.classifications.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            status === 'confirmed' 
                              ? 'default' 
                              : status === 'pending' 
                              ? 'secondary' 
                              : 'destructive'
                          }
                        >
                          {status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count}</span>
                        <Progress 
                          value={(count / dashboardStats.classifications.total) * 100} 
                          className="w-16" 
                        />
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Top Namespaces */}
            <Card>
              <CardHeader>
                <CardTitle>Top Namespaces</CardTitle>
                <CardDescription>By API usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardStats?.usage.topNamespaces.map((namespace, index) => (
                  <div key={namespace.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">{namespace.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {namespace.usage.toLocaleString()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivityCard />
            <UsageChart />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <UsageChart />
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Service status and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">150ms</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">0.01%</div>
                  <div className="text-sm text-muted-foreground">Error Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
