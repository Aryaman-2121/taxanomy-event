/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Bulk Operations Modal - Import/Export/Bulk Actions
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { taxonomyApi } from '@/lib/api/taxonomy-client';
import { useTaxonomyStore } from '@/lib/stores/taxonomy-store';
import { downloadFile } from '@/lib/utils';
import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  File,
  Database,
} from 'lucide-react';

interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{
    line: number;
    error: string;
  }>;
}

export function BulkOperationsModal() {
  const queryClient = useQueryClient();
  const { ui, closeBulkOperations, addNotification } = useTaxonomyStore();
  const [activeTab, setActiveTab] = React.useState<'import' | 'export'>('import');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [importProgress, setImportProgress] = React.useState(0);
  const [importResult, setImportResult] = React.useState<BulkOperationResult | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      try {
        // Mock API call - replace with actual implementation
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        clearInterval(progressInterval);
        setImportProgress(100);
        
        return {
          success: 145,
          failed: 5,
          errors: [
            { line: 12, error: 'Invalid category name format' },
            { line: 34, error: 'Duplicate category in namespace' },
            { line: 67, error: 'Missing required field: display_name' },
            { line: 89, error: 'Invalid parent category reference' },
            { line: 123, error: 'Namespace does not exist' },
          ],
        };
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    },
    onSuccess: (result) => {
      setImportResult(result);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['namespaces'] });
      
      addNotification({
        type: result.failed === 0 ? 'success' : 'warning',
        title: 'Import Complete',
        message: `Successfully imported ${result.success} items${result.failed > 0 ? `, ${result.failed} failed` : ''}.`,
      });
    },
    onError: (error) => {
      setImportProgress(0);
      addNotification({
        type: 'error',
        title: 'Import Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (format: 'csv' | 'json') => {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const data = {
        namespaces: [
          { id: 'events', name: 'events', display_name: 'Events' },
          { id: 'venues', name: 'venues', display_name: 'Venues' },
        ],
        categories: [
          { id: '1', name: 'music_events', display_name: 'Music Events', namespace_id: 'events' },
          { id: '2', name: 'sports_events', display_name: 'Sports Events', namespace_id: 'events' },
        ],
        classifications: [],
      };

      return { data, format };
    },
    onSuccess: ({ data, format }) => {
      const filename = `taxonomy-export-${new Date().toISOString().split('T')[0]}.${format}`;
      
      if (format === 'json') {
        downloadFile(data, filename, 'application/json');
      } else {
        // Convert to CSV format
        const csv = convertToCSV(data);
        downloadFile(csv, filename, 'text/csv');
      }
      
      addNotification({
        type: 'success',
        title: 'Export Complete',
        message: `Data exported as ${filename}`,
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });

  const convertToCSV = (data: any): string => {
    // Simple CSV conversion - enhance as needed
    const categories = data.categories || [];
    const headers = ['id', 'name', 'display_name', 'namespace_id', 'status'];
    const rows = categories.map((cat: any) => 
      headers.map(header => cat[header] || '').join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
      setImportProgress(0);
    }
  };

  const handleImport = () => {
    if (!selectedFile) return;
    importMutation.mutate(selectedFile);
  };

  const handleExport = (format: 'csv' | 'json') => {
    exportMutation.mutate(format);
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportResult(null);
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!ui.bulkOperationsOpen) return null;

  return (
    <Dialog open={ui.bulkOperationsOpen} onOpenChange={closeBulkOperations}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Operations</DialogTitle>
          <DialogDescription>
            Import, export, and manage large datasets efficiently
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'import' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('import')}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button
              variant={activeTab === 'export' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('export')}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Import Taxonomies
                  </CardTitle>
                  <CardDescription>
                    Import categories, namespaces, and classifications from CSV or JSON files
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File Selection */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      {selectedFile ? (
                        <div className="space-y-2">
                          <File className="h-8 w-8 mx-auto text-blue-500" />
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Choose Different File
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p>Drag and drop your file here, or click to browse</p>
                          <p className="text-sm text-muted-foreground">
                            Supports CSV and JSON formats
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Choose File
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Import Progress */}
                  {importMutation.isPending && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Importing...</span>
                        <span className="text-sm text-muted-foreground">
                          {importProgress}%
                        </span>
                      </div>
                      <Progress value={importProgress} />
                    </div>
                  )}

                  {/* Import Result */}
                  {importResult && (
                    <div className="space-y-4">
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Import completed: {importResult.success} successful, {importResult.failed} failed
                        </AlertDescription>
                      </Alert>

                      {importResult.errors.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Import Errors</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {importResult.errors.map((error, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-2 text-sm p-2 bg-destructive/10 rounded"
                                >
                                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium">Line {error.line}:</span>{' '}
                                    {error.error}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2">
                    {importResult && (
                      <Button variant="outline" onClick={resetImport}>
                        Import Another File
                      </Button>
                    )}
                    <Button
                      onClick={handleImport}
                      disabled={!selectedFile || importMutation.isPending}
                    >
                      {importMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Import Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Import Format Documentation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Import Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <p><strong>CSV Format:</strong> Include headers in the first row</p>
                    <p><strong>Required columns:</strong> name, display_name, namespace_id</p>
                    <p><strong>Optional columns:</strong> description, parent_id, status, sort_order</p>
                    <p><strong>JSON Format:</strong> Array of objects with the same field structure</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Export Categories
                    </CardTitle>
                    <CardDescription>
                      Export all categories with their hierarchical relationships
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Includes all category data, parent-child relationships, and metadata
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleExport('json')}
                        disabled={exportMutation.isPending}
                      >
                        {exportMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        JSON
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport('csv')}
                        disabled={exportMutation.isPending}
                      >
                        {exportMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Export Namespaces */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Export Namespaces
                    </CardTitle>
                    <CardDescription>
                      Export namespace configuration and quotas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Includes namespace settings, quotas, and status information
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleExport('json')}
                        disabled={exportMutation.isPending}
                      >
                        {exportMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        JSON
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport('csv')}
                        disabled={exportMutation.isPending}
                      >
                        {exportMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Export Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Include metadata</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Include inactive items</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">Include usage statistics</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={closeBulkOperations}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
