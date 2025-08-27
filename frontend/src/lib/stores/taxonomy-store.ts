/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Taxonomy Store - Zustand Client State
 * Template: Eventzr Code Repository Template v1.0
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Namespace, Category, Classification, Tag } from '@/lib/api/taxonomy-client';

// Filter states
export interface NamespaceFilters {
  search: string;
  status: 'all' | 'active' | 'inactive' | 'deprecated';
  sort: 'name' | 'created_at' | 'updated_at';
  order: 'asc' | 'desc';
}

export interface CategoryFilters {
  namespace: string;
  entityType: string;
  parentId: string;
  status: 'all' | 'draft' | 'active' | 'deprecated' | 'archived';
  search: string;
  depthMin: number;
  depthMax: number;
  isLeaf: boolean | null;
  sort: 'name' | 'sort_order' | 'created_at' | 'updated_at';
  order: 'asc' | 'desc';
}

export interface ClassificationFilters {
  entityType: string;
  entityId: string;
  categoryId: string;
  status: 'all' | 'pending' | 'confirmed' | 'rejected' | 'expired';
  assignedBy: 'all' | 'system' | 'user' | 'ai' | 'import';
  confidenceMin: number;
  confidenceMax: number;
  includeCategory: boolean;
  sort: 'confidence_score' | 'assigned_at' | 'created_at';
  order: 'asc' | 'desc';
}

// UI state
export interface UIState {
  // Navigation
  activeTab: 'dashboard' | 'namespaces' | 'categories' | 'classifications' | 'search';
  sidebarOpen: boolean;
  
  // Modals and dialogs
  createNamespaceOpen: boolean;
  createCategoryOpen: boolean;
  createClassificationOpen: boolean;
  bulkOperationsOpen: boolean;
  confirmDeleteOpen: boolean;
  deleteTarget: { type: 'namespace' | 'category' | 'classification'; id: string } | null;
  
  // Category tree
  selectedCategoryId: string | null;
  expandedCategoryIds: Set<string>;
  categoryTreeLoading: boolean;
  
  // Data table states
  selectedRows: Set<string>;
  bulkActionMode: boolean;
  
  // Search
  searchQuery: string;
  searchFilters: {
    type: 'all' | 'categories' | 'namespaces' | 'tags' | 'classifications';
    namespace: string;
    status: string;
  };
  
  // Form states
  editingCategory: Category | null;
  editingNamespace: Namespace | null;
  editingClassification: Classification | null;
  
  // Toast notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: number;
    duration?: number;
  }>;
}

// Store state
interface TaxonomyStoreState {
  // UI state
  ui: UIState;
  
  // Filter states
  namespaceFilters: NamespaceFilters;
  categoryFilters: CategoryFilters;
  classificationFilters: ClassificationFilters;
  
  // Recent data (for quick access)
  recentNamespaces: Namespace[];
  recentCategories: Category[];
  recentClassifications: Classification[];
  
  // Cache
  categoryTree: Record<string, Category[]>; // Key: `${namespace}-${entityType}`
  breadcrumbs: Record<string, string[]>; // Key: category ID
  
  // Statistics
  stats: {
    totalNamespaces: number;
    totalCategories: number;
    totalClassifications: number;
    monthlyGrowth: {
      namespaces: number;
      categories: number;
      classifications: number;
    };
    topCategories: Array<{
      id: string;
      name: string;
      count: number;
    }>;
    lastUpdated: number;
  };
}

// Store actions
interface TaxonomyStoreActions {
  // UI actions
  setActiveTab: (tab: UIState['activeTab']) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Modal actions
  openCreateNamespace: () => void;
  closeCreateNamespace: () => void;
  openCreateCategory: () => void;
  closeCreateCategory: () => void;
  openCreateClassification: () => void;
  closeCreateClassification: () => void;
  openBulkOperations: () => void;
  closeBulkOperations: () => void;
  openConfirmDelete: (type: 'namespace' | 'category' | 'classification', id: string) => void;
  closeConfirmDelete: () => void;
  
  // Category tree actions
  setSelectedCategory: (id: string | null) => void;
  toggleCategoryExpanded: (id: string) => void;
  setCategoryExpanded: (id: string, expanded: boolean) => void;
  setCategoryTreeLoading: (loading: boolean) => void;
  setCategoryTree: (key: string, categories: Category[]) => void;
  
  // Selection actions
  toggleRowSelection: (id: string) => void;
  setRowSelection: (ids: Set<string>) => void;
  clearRowSelection: () => void;
  setBulkActionMode: (enabled: boolean) => void;
  
  // Filter actions
  setNamespaceFilters: (filters: Partial<NamespaceFilters>) => void;
  setCategoryFilters: (filters: Partial<CategoryFilters>) => void;
  setClassificationFilters: (filters: Partial<ClassificationFilters>) => void;
  resetFilters: (type: 'namespace' | 'category' | 'classification') => void;
  
  // Search actions
  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: Partial<UIState['searchFilters']>) => void;
  
  // Form actions
  setEditingCategory: (category: Category | null) => void;
  setEditingNamespace: (namespace: Namespace | null) => void;
  setEditingClassification: (classification: Classification | null) => void;
  
  // Data actions
  setRecentNamespaces: (namespaces: Namespace[]) => void;
  setRecentCategories: (categories: Category[]) => void;
  setRecentClassifications: (classifications: Classification[]) => void;
  setBreadcrumbs: (categoryId: string, breadcrumbs: string[]) => void;
  updateStats: (stats: Partial<TaxonomyStoreState['stats']>) => void;
  
  // Notification actions
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Utility actions
  reset: () => void;
}

// Default states
const defaultNamespaceFilters: NamespaceFilters = {
  search: '',
  status: 'all',
  sort: 'name',
  order: 'asc',
};

const defaultCategoryFilters: CategoryFilters = {
  namespace: '',
  entityType: '',
  parentId: '',
  status: 'all',
  search: '',
  depthMin: 0,
  depthMax: 10,
  isLeaf: null,
  sort: 'name',
  order: 'asc',
};

const defaultClassificationFilters: ClassificationFilters = {
  entityType: '',
  entityId: '',
  categoryId: '',
  status: 'all',
  assignedBy: 'all',
  confidenceMin: 0,
  confidenceMax: 100,
  includeCategory: true,
  sort: 'created_at',
  order: 'desc',
};

const defaultUIState: UIState = {
  activeTab: 'dashboard',
  sidebarOpen: true,
  createNamespaceOpen: false,
  createCategoryOpen: false,
  createClassificationOpen: false,
  bulkOperationsOpen: false,
  confirmDeleteOpen: false,
  deleteTarget: null,
  selectedCategoryId: null,
  expandedCategoryIds: new Set(),
  categoryTreeLoading: false,
  selectedRows: new Set(),
  bulkActionMode: false,
  searchQuery: '',
  searchFilters: {
    type: 'all',
    namespace: '',
    status: '',
  },
  editingCategory: null,
  editingNamespace: null,
  editingClassification: null,
  notifications: [],
};

const defaultStats = {
  totalNamespaces: 0,
  totalCategories: 0,
  totalClassifications: 0,
  monthlyGrowth: {
    namespaces: 0,
    categories: 0,
    classifications: 0,
  },
  topCategories: [],
  lastUpdated: 0,
};

// Create store
export const useTaxonomyStore = create<TaxonomyStoreState & TaxonomyStoreActions>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial state
        ui: defaultUIState,
        namespaceFilters: defaultNamespaceFilters,
        categoryFilters: defaultCategoryFilters,
        classificationFilters: defaultClassificationFilters,
        recentNamespaces: [],
        recentCategories: [],
        recentClassifications: [],
        categoryTree: {},
        breadcrumbs: {},
        stats: defaultStats,

        // Actions
        setActiveTab: (tab) =>
          set((state) => {
            state.ui.activeTab = tab;
          }),

        toggleSidebar: () =>
          set((state) => {
            state.ui.sidebarOpen = !state.ui.sidebarOpen;
          }),

        setSidebarOpen: (open) =>
          set((state) => {
            state.ui.sidebarOpen = open;
          }),

        openCreateNamespace: () =>
          set((state) => {
            state.ui.createNamespaceOpen = true;
          }),

        closeCreateNamespace: () =>
          set((state) => {
            state.ui.createNamespaceOpen = false;
          }),

        openCreateCategory: () =>
          set((state) => {
            state.ui.createCategoryOpen = true;
          }),

        closeCreateCategory: () =>
          set((state) => {
            state.ui.createCategoryOpen = false;
          }),

        openCreateClassification: () =>
          set((state) => {
            state.ui.createClassificationOpen = true;
          }),

        closeCreateClassification: () =>
          set((state) => {
            state.ui.createClassificationOpen = false;
          }),

        openBulkOperations: () =>
          set((state) => {
            state.ui.bulkOperationsOpen = true;
          }),

        closeBulkOperations: () =>
          set((state) => {
            state.ui.bulkOperationsOpen = false;
          }),

        openConfirmDelete: (type, id) =>
          set((state) => {
            state.ui.confirmDeleteOpen = true;
            state.ui.deleteTarget = { type, id };
          }),

        closeConfirmDelete: () =>
          set((state) => {
            state.ui.confirmDeleteOpen = false;
            state.ui.deleteTarget = null;
          }),

        setSelectedCategory: (id) =>
          set((state) => {
            state.ui.selectedCategoryId = id;
          }),

        toggleCategoryExpanded: (id) =>
          set((state) => {
            if (state.ui.expandedCategoryIds.has(id)) {
              state.ui.expandedCategoryIds.delete(id);
            } else {
              state.ui.expandedCategoryIds.add(id);
            }
          }),

        setCategoryExpanded: (id, expanded) =>
          set((state) => {
            if (expanded) {
              state.ui.expandedCategoryIds.add(id);
            } else {
              state.ui.expandedCategoryIds.delete(id);
            }
          }),

        setCategoryTreeLoading: (loading) =>
          set((state) => {
            state.ui.categoryTreeLoading = loading;
          }),

        setCategoryTree: (key, categories) =>
          set((state) => {
            state.categoryTree[key] = categories;
          }),

        toggleRowSelection: (id) =>
          set((state) => {
            if (state.ui.selectedRows.has(id)) {
              state.ui.selectedRows.delete(id);
            } else {
              state.ui.selectedRows.add(id);
            }
          }),

        setRowSelection: (ids) =>
          set((state) => {
            state.ui.selectedRows = new Set(ids);
          }),

        clearRowSelection: () =>
          set((state) => {
            state.ui.selectedRows.clear();
          }),

        setBulkActionMode: (enabled) =>
          set((state) => {
            state.ui.bulkActionMode = enabled;
            if (!enabled) {
              state.ui.selectedRows.clear();
            }
          }),

        setNamespaceFilters: (filters) =>
          set((state) => {
            Object.assign(state.namespaceFilters, filters);
          }),

        setCategoryFilters: (filters) =>
          set((state) => {
            Object.assign(state.categoryFilters, filters);
          }),

        setClassificationFilters: (filters) =>
          set((state) => {
            Object.assign(state.classificationFilters, filters);
          }),

        resetFilters: (type) =>
          set((state) => {
            switch (type) {
              case 'namespace':
                state.namespaceFilters = { ...defaultNamespaceFilters };
                break;
              case 'category':
                state.categoryFilters = { ...defaultCategoryFilters };
                break;
              case 'classification':
                state.classificationFilters = { ...defaultClassificationFilters };
                break;
            }
          }),

        setSearchQuery: (query) =>
          set((state) => {
            state.ui.searchQuery = query;
          }),

        setSearchFilters: (filters) =>
          set((state) => {
            Object.assign(state.ui.searchFilters, filters);
          }),

        setEditingCategory: (category) =>
          set((state) => {
            state.ui.editingCategory = category;
          }),

        setEditingNamespace: (namespace) =>
          set((state) => {
            state.ui.editingNamespace = namespace;
          }),

        setEditingClassification: (classification) =>
          set((state) => {
            state.ui.editingClassification = classification;
          }),

        setRecentNamespaces: (namespaces) =>
          set((state) => {
            state.recentNamespaces = namespaces.slice(0, 10);
          }),

        setRecentCategories: (categories) =>
          set((state) => {
            state.recentCategories = categories.slice(0, 10);
          }),

        setRecentClassifications: (classifications) =>
          set((state) => {
            state.recentClassifications = classifications.slice(0, 10);
          }),

        setBreadcrumbs: (categoryId, breadcrumbs) =>
          set((state) => {
            state.breadcrumbs[categoryId] = breadcrumbs;
          }),

        updateStats: (stats) =>
          set((state) => {
            Object.assign(state.stats, stats, { lastUpdated: Date.now() });
          }),

        addNotification: (notification) =>
          set((state) => {
            const id = `${Date.now()}-${Math.random()}`;
            state.ui.notifications.push({
              ...notification,
              id,
              timestamp: Date.now(),
            });
          }),

        removeNotification: (id) =>
          set((state) => {
            const index = state.ui.notifications.findIndex((n) => n.id === id);
            if (index > -1) {
              state.ui.notifications.splice(index, 1);
            }
          }),

        clearNotifications: () =>
          set((state) => {
            state.ui.notifications = [];
          }),

        reset: () =>
          set(() => ({
            ui: { ...defaultUIState },
            namespaceFilters: { ...defaultNamespaceFilters },
            categoryFilters: { ...defaultCategoryFilters },
            classificationFilters: { ...defaultClassificationFilters },
            recentNamespaces: [],
            recentCategories: [],
            recentClassifications: [],
            categoryTree: {},
            breadcrumbs: {},
            stats: { ...defaultStats },
          })),
      })),
      {
        name: 'taxonomy-store',
        partialize: (state) => ({
          ui: {
            sidebarOpen: state.ui.sidebarOpen,
            expandedCategoryIds: Array.from(state.ui.expandedCategoryIds),
          },
          namespaceFilters: state.namespaceFilters,
          categoryFilters: state.categoryFilters,
          classificationFilters: state.classificationFilters,
          recentNamespaces: state.recentNamespaces,
          recentCategories: state.recentCategories,
          recentClassifications: state.recentClassifications,
        }),
        onRehydrateStorage: () => (state) => {
          if (state?.ui.expandedCategoryIds) {
            // Convert array back to Set
            state.ui.expandedCategoryIds = new Set(state.ui.expandedCategoryIds as any);
          }
        },
      }
    ),
    { name: 'taxonomy-store' }
  )
);

// Export selectors for performance
export const useNamespaceFilters = () => useTaxonomyStore((state) => state.namespaceFilters);
export const useCategoryFilters = () => useTaxonomyStore((state) => state.categoryFilters);
export const useClassificationFilters = () => useTaxonomyStore((state) => state.classificationFilters);
export const useUIState = () => useTaxonomyStore((state) => state.ui);
export const useStats = () => useTaxonomyStore((state) => state.stats);
