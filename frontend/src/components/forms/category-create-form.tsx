/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Category Create Form - React Hook Form + Zod
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { taxonomyApi, CreateCategoryRequest } from '@/lib/api/taxonomy-client';
import { useTaxonomyStore } from '@/lib/stores/taxonomy-store';
import { cn } from '@/lib/utils';
import { Loader2, Save, X, FolderTree, Plus, AlertCircle, Check } from 'lucide-react';

const categorySchema = z.object({
  namespace_id: z.string().min(1, 'Namespace is required'),
  entity_type: z.string().min(1, 'Entity type is required'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-z][a-z0-9_]*$/, 'Name must be lowercase alphanumeric with underscores'),
  display_name: z.string()
    .min(1, 'Display name is required')
    .max(200, 'Display name must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').default(''),
  parent_id: z.string().default('root'),
  sort_order: z.number().min(0).max(999999).default(0),
  metadata: z.record(z.any()).default({}),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryCreateFormProps {
  onSuccess?: (categoryId: string) => void;
  onCancel?: () => void;
  defaultNamespace?: string;
  defaultEntityType?: string;
  defaultParentId?: string;
  className?: string;
}

export function CategoryCreateForm({
  onSuccess,
  onCancel,
  defaultNamespace = '',
  defaultEntityType = '',
  defaultParentId = '',
  className,
}: CategoryCreateFormProps) {
  const queryClient = useQueryClient();
  const { addNotification } = useTaxonomyStore();
  
  // Fetch namespaces for selection
  const { data: namespacesData } = useQuery({
    queryKey: ['namespaces', 'list'],
    queryFn: () => taxonomyApi.getNamespaces(1, 100, { status: 'active' }),
  });

  // Fetch parent categories when namespace and entity type are selected
  const { data: parentCategoriesData, isLoading: loadingParents } = useQuery({
    queryKey: ['categories', 'parents', defaultNamespace, defaultEntityType],
    queryFn: () =>
      taxonomyApi.getCategories(1, 100, {
        namespace: defaultNamespace,
        entity_type: defaultEntityType,
        status: 'active',
        sort: 'sort_order',
        order: 'asc',
      }),
    enabled: Boolean(defaultNamespace && defaultEntityType),
  });

  // Form setup
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      namespace_id: defaultNamespace,
      entity_type: defaultEntityType,
      parent_id: defaultParentId || 'root',
      name: '',
      display_name: '',
      description: '',
      sort_order: 0,
      metadata: {},
    },
  });

  const { watch, setValue, formState: { errors, isValid } } = form;
  const watchedNamespace = watch('namespace_id');
  const watchedEntityType = watch('entity_type');
  const watchedName = watch('name');
  const watchedDisplayName = watch('display_name');

  // Auto-generate name from display name
  React.useEffect(() => {
    if (watchedDisplayName && !watchedName) {
      const generatedName = watchedDisplayName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 100);
      setValue('name', generatedName);
    }
  }, [watchedDisplayName, watchedName, setValue]);

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => taxonomyApi.createCategory(data),
    onSuccess: (response) => {
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Category Created',
          message: `Category "${response.data.display_name}" has been created successfully.`,
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['category-tree'] });
        
        onSuccess?.(response.data.id);
        form.reset();
      }
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Failed to Create Category',
        message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      });
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    // Ensure all required fields are present for CreateCategoryRequest
    const requestData: CreateCategoryRequest = {
      namespace_id: data.namespace_id,
      entity_type: data.entity_type,
      name: data.name,
      display_name: data.display_name,
      description: data.description || undefined,
      parent_id: data.parent_id === 'root' ? undefined : data.parent_id,
      sort_order: data.sort_order,
      metadata: data.metadata
    };
    createCategoryMutation.mutate(requestData);
  };

  const entityTypes = [
    { value: 'events', label: 'Events' },
    { value: 'venues', label: 'Venues' },
    { value: 'content', label: 'Content' },
    { value: 'services', label: 'Services' },
    { value: 'products', label: 'Products' },
    { value: 'artists', label: 'Artists' },
    { value: 'sponsors', label: 'Sponsors' },
    { value: 'media', label: 'Media' },
  ];

  return (
    <Card className={cn('w-full max-w-2xl', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderTree className="h-5 w-5" />
          Create New Category
        </CardTitle>
        <CardDescription>
          Add a new category to organize and classify entities in your taxonomy.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Namespace and Entity Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="namespace_id">Namespace</Label>
              <Select
                value={watchedNamespace}
                onValueChange={(value) => setValue('namespace_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select namespace" />
                </SelectTrigger>
                <SelectContent>
                  {namespacesData?.data.map((namespace) => (
                    <SelectItem key={namespace.id} value={namespace.id}>
                      <div className="flex items-center gap-2">
                        <span>{namespace.display_name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {namespace.name}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.namespace_id && (
                <p className="text-sm text-destructive">{errors.namespace_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="entity_type">Entity Type</Label>
              <Select
                value={watchedEntityType}
                onValueChange={(value) => setValue('entity_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  {entityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.entity_type && (
                <p className="text-sm text-destructive">{errors.entity_type.message}</p>
              )}
            </div>
          </div>

          {/* Parent Category Selection */}
          {watchedNamespace && watchedEntityType && (
            <div className="space-y-2">
              <Label htmlFor="parent_id">Parent Category (Optional)</Label>
              <Select
                value={watch('parent_id') || 'root'}
                onValueChange={(value) => setValue('parent_id', value === 'root' ? undefined : value)}
                disabled={loadingParents}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent category or leave empty for root level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">
                    <em>Root Level (No Parent)</em>
                  </SelectItem>
                  {parentCategoriesData?.data.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span style={{ paddingLeft: `${category.depth * 12}px` }}>
                          {category.display_name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Level {category.depth + 1}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                placeholder="e.g., Music Events"
                {...form.register('display_name')}
              />
              {errors.display_name && (
                <p className="text-sm text-destructive">{errors.display_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Internal Name</Label>
              <Input
                id="name"
                placeholder="e.g., music_events"
                {...form.register('name')}
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from display name. Must be lowercase with underscores.
              </p>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what this category encompasses..."
              rows={3}
              {...form.register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              type="number"
              min="0"
              max="999999"
              placeholder="0"
              {...form.register('sort_order', { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              Controls the display order within the same level. Lower numbers appear first.
            </p>
            {errors.sort_order && (
              <p className="text-sm text-destructive">{errors.sort_order.message}</p>
            )}
          </div>

          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please correct the following errors before submitting:
                <ul className="list-disc list-inside mt-2">
                  {Object.entries(errors).map(([field, error]) => {
                    // Safely extract error message from React Hook Form error object
                    const getErrorMessage = () => {
                      if (typeof error === 'string') return error;
                      if (error && typeof error === 'object' && 'message' in error) {
                        return String(error.message);
                      }
                      return `Invalid ${field}`;
                    };
                    
                    return (
                      <li key={field} className="text-sm">
                        {getErrorMessage()}
                      </li>
                    );
                  })}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {watchedDisplayName && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Preview</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Full Path:</span>{' '}
                  {watchedNamespace && watchedEntityType ? (
                    <code className="bg-muted px-1 rounded">
                      /{watchedNamespace}/{watchedEntityType}/{watchedName || 'category_name'}
                    </code>
                  ) : (
                    <span className="text-muted-foreground">Complete namespace and entity type first</span>
                  )}
                </div>
                <div>
                  <span className="font-medium">Display:</span> {watchedDisplayName}
                </div>
                {watch('description') && (
                  <div>
                    <span className="font-medium">Description:</span> {watch('description')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <Button
              type="submit"
              disabled={createCategoryMutation.isPending || !isValid}
              className="flex-1"
            >
              {createCategoryMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Create Category
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={createCategoryMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

