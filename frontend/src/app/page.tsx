/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Home Page - Taxonomy Dashboard
 * Template: Eventzr Code Repository Template v1.0
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';
import { Card } from '@/components/ui/card';
import { 
  FolderTree, 
  Tags, 
  Layers, 
  BarChart3 
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Taxonomy Dashboard | Eventzr',
  description: 'Overview of your taxonomy management system with namespaces, categories, and classifications',
};

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend 
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  trend?: string;
}) => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex items-center space-x-2">
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <span className="text-sm text-green-600">
              {trend}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Icon className="h-8 w-8 text-muted-foreground" />
    </div>
  </Card>
);

export default function HomePage() {
  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">
          Taxonomy Management
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Organize and classify your entities with intelligent hierarchical taxonomies
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Namespaces"
          value="12"
          icon={Layers}
          description="Currently managed"
          trend="+2 this month"
        />
        <StatCard
          title="Total Categories"
          value="1,247"
          icon={FolderTree}
          description="Across all namespaces"
          trend="+156 this month"
        />
        <StatCard
          title="Active Classifications"
          value="8,532"
          icon={Tags}
          description="Entity assignments"
          trend="+1,203 this month"
        />
        <StatCard
          title="Monthly Usage"
          value="45.2K"
          icon={BarChart3}
          description="API calls this month"
          trend="+12% vs last month"
        />
      </div>

      {/* Main Dashboard */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <a href="/namespaces" className="block text-primary hover:underline">
                Manage Namespaces
              </a>
              <a href="/categories" className="block text-primary hover:underline">
                Manage Categories
              </a>
              <a href="/classifications" className="block text-primary hover:underline">
                View Classifications
              </a>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">
              No recent activity to display
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">System Status</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">All systems operational</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Quick Start</h3>
          <p className="text-muted-foreground mb-4">
            New to taxonomy management? Get started with our guided tour.
          </p>
          <a href="/help/tour" className="text-primary hover:underline">
            Take the tour →
          </a>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Bulk Operations</h3>
          <p className="text-muted-foreground mb-4">
            Import or export taxonomies, manage bulk classifications.
          </p>
          <a href="/bulk" className="text-primary hover:underline">
            Manage bulk data →
          </a>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Analytics</h3>
          <p className="text-muted-foreground mb-4">
            View detailed analytics and insights about your taxonomies.
          </p>
          <a href="/analytics" className="text-primary hover:underline">
            View analytics →
          </a>
        </Card>
      </div>
    </div>
  );
}

