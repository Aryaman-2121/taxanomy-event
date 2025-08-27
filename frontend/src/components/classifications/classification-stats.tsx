/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Classification Stats Component - Statistics for Classifications
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react';

interface ClassificationStatsProps {
  entityType?: string;
  status?: string;
  assignedBy?: string;
}

export function ClassificationStats({
  entityType,
  status,
  assignedBy
}: ClassificationStatsProps) {
  // Mock data - in real app, this would come from API
  const stats = {
    total: 12847,
    active: 11234,
    pending: 987,
    rejected: 626,
    averageConfidence: 87.3,
    autoAssigned: 8945,
    manualAssigned: 3902,
    recentlyUpdated: 234
  };

  const confidenceDistribution = [
    { range: '90-100%', count: 5623, percentage: 43.8, color: 'bg-green-500' },
    { range: '80-89%', count: 3421, percentage: 26.6, color: 'bg-blue-500' },
    { range: '70-79%', count: 2234, percentage: 17.4, color: 'bg-yellow-500' },
    { range: '60-69%', count: 1012, percentage: 7.9, color: 'bg-orange-500' },
    { range: '<60%', count: 557, percentage: 4.3, color: 'bg-red-500' }
  ];

  const entityTypeStats = [
    { type: 'events', count: 6423, percentage: 50.0 },
    { type: 'venues', count: 3211, percentage: 25.0 },
    { type: 'content', count: 1926, percentage: 15.0 },
    { type: 'users', count: 1287, percentage: 10.0 }
  ];

  const getStatusIcon = (statusType: string) => {
    switch (statusType) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Classifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Classifications</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+234</span> from last month
          </p>
        </CardContent>
      </Card>

      {/* Active Classifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.active.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.active / stats.total) * 100).toFixed(1)}% of total
          </p>
          <Progress 
            value={(stats.active / stats.total) * 100} 
            className="mt-2 h-2"
          />
        </CardContent>
      </Card>

      {/* Average Confidence */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageConfidence}%</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+2.1%</span> from last week
          </p>
          <Progress 
            value={stats.averageConfidence} 
            className="mt-2 h-2"
          />
        </CardContent>
      </Card>

      {/* Auto vs Manual */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assignment Type</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Auto</span>
              <span className="text-sm font-medium">{stats.autoAssigned.toLocaleString()}</span>
            </div>
            <Progress 
              value={(stats.autoAssigned / stats.total) * 100} 
              className="h-2"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm">Manual</span>
              <span className="text-sm font-medium">{stats.manualAssigned.toLocaleString()}</span>
            </div>
            <Progress 
              value={(stats.manualAssigned / stats.total) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getStatusIcon('active')}
                <span className="font-medium">Active</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.active.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                {((stats.active / stats.total) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getStatusIcon('pending')}
                <span className="font-medium">Pending</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                {((stats.pending / stats.total) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getStatusIcon('rejected')}
                <span className="font-medium">Rejected</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{stats.rejected.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                {((stats.rejected / stats.total) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confidence Distribution */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Confidence Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {confidenceDistribution.map((item) => (
              <div key={item.range} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.range}</span>
                  <span>{item.count.toLocaleString()} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Entity Type Breakdown */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Entity Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {entityTypeStats.map((item) => (
              <div key={item.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {item.type}
                    </Badge>
                  </div>
                  <span className="font-medium">{item.count.toLocaleString()}</span>
                </div>
                <Progress 
                  value={item.percentage} 
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {item.percentage}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Updated in last 24h</span>
              <Badge variant="secondary">{stats.recentlyUpdated}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto-classifications today</span>
              <Badge variant="secondary">1,234</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Manual reviews pending</span>
              <Badge variant="outline">89</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Quality score</span>
              <Badge variant="default">94.2%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
