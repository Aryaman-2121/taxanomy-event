/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Namespace List Component - Data Table
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { taxonomyApi, Namespace } from '@/lib/api/taxonomy-client';
import { useTaxonomyStore } from '@/lib/stores/taxonomy-store';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Copy,
  Settings,
} from 'lucide-react';

interface NamespaceListProps {
  page: number;
  limit: number;
  search: string;
  status: 'all' | 'active' | 'inactive' | 'deprecated';
  sort: string;
  order: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    active: 'default',
    inactive: 'secondary',
    deprecated: 'destructive',
  } as const;

  return (
    <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
      {status}
    </Badge>
  );
};

const NamespaceActions = ({ namespace }: { namespace: Namespace }) => {
  const { setEditingNamespace, openConfirmDelete } = useTaxonomyStore();

  const handleEdit = () => {
    setEditingNamespace(namespace);
  };

  const handleDelete = () => {
    openConfirmDelete('namespace', namespace.id);
  };

  const handleViewCategories = () => {
    // Navigate to categories filtered by this namespace
    window.location.href = `/categories?namespace=${namespace.id}`;
  };

  const handleExport = () => {
    // Trigger namespace export
    console.log('Export namespace:', namespace.id);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(namespace.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleViewCategories}>
          <Eye className="mr-2 h-4 w-4" />
          View Categories
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function NamespaceList({
  page,
  limit,
  search,
  status,
  sort,
  order,
}: NamespaceListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['namespaces', page, limit, search, status, sort, order],
    queryFn: () =>
      taxonomyApi.getNamespaces(page, limit, {
        search,
        status: status === 'all' ? undefined : status,
        sort: sort as any,
        order: order as any,
      }),
  });

  const columns = [
    {
      accessorKey: 'display_name',
      header: 'Name',
      cell: ({ row }: { row: { original: Namespace } }) => {
        const namespace = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{namespace.display_name}</span>
            <span className="text-sm text-muted-foreground font-mono">
              {namespace.name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: { row: { original: Namespace } }) => {
        const description = row.original.description;
        return description ? (
          <span className="text-sm">{description}</span>
        ) : (
          <span className="text-sm text-muted-foreground italic">No description</span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: Namespace } }) => (
        <StatusBadge status={row.original.status} />
      ),
    },
    {
      accessorKey: 'quota_categories',
      header: 'Quotas',
      cell: ({ row }: { row: { original: Namespace } }) => {
        const namespace = row.original;
        return (
          <div className="text-sm">
            <div>Categories: {namespace.quota_categories || 'Unlimited'}</div>
            <div className="text-muted-foreground">
              Classifications: {namespace.quota_classifications || 'Unlimited'}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }: { row: { original: Namespace } }) => (
        <div className="text-sm">
          <div>{formatDate(row.original.created_at)}</div>
          <div className="text-muted-foreground">
            {formatRelativeTime(row.original.created_at)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'updated_at',
      header: 'Updated',
      cell: ({ row }: { row: { original: Namespace } }) => (
        <div className="text-sm">
          <div>{formatDate(row.original.updated_at)}</div>
          <div className="text-muted-foreground">
            {formatRelativeTime(row.original.updated_at)}
          </div>
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }: { row: { original: Namespace } }) => (
        <NamespaceActions namespace={row.original} />
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-2">Failed to load namespaces</p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Namespaces</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data?.data || []}
          pagination={data?.pagination}
          loading={isLoading}
        />
      </CardContent>
    </Card>
  );
}

