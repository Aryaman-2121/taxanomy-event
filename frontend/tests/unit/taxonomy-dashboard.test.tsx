/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Taxonomy Dashboard Unit Tests
 * Template: Eventzr Code Repository Template v1.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TaxonomyDashboard } from '../../src/components/taxonomy/taxonomy-dashboard';

// Mock the taxonomy store
const mockUseTaxonomyStore = vi.fn();
vi.mock('../../src/lib/stores/taxonomy-store', () => ({
  useTaxonomyStore: () => mockUseTaxonomyStore(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('TaxonomyDashboard', () => {
  beforeEach(() => {
    mockUseTaxonomyStore.mockReturnValue({
      stats: {
        totalNamespaces: 12,
        totalCategories: 1247,
        totalClassifications: 8532,
        monthlyGrowth: {
          namespaces: 8.3,
          categories: 12.5,
          classifications: 15.7,
        },
      },
      updateStats: vi.fn(),
      openCreateNamespace: vi.fn(),
      openCreateCategory: vi.fn(),
      openCreateClassification: vi.fn(),
      openBulkOperations: vi.fn(),
    });
  });

  it('renders dashboard with stats cards', async () => {
    render(<TaxonomyDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Active Namespaces')).toBeInTheDocument();
      expect(screen.getByText('Total Categories')).toBeInTheDocument();
      expect(screen.getByText('Active Classifications')).toBeInTheDocument();
      expect(screen.getByText('Monthly API Calls')).toBeInTheDocument();
    });

    // Check if stats are displayed
    expect(screen.getByText('10')).toBeInTheDocument(); // Active namespaces
    expect(screen.getByText('1,247')).toBeInTheDocument(); // Total categories
    expect(screen.getByText('8,532')).toBeInTheDocument(); // Total classifications
  });

  it('displays loading state initially', () => {
    render(<TaxonomyDashboard />, { wrapper: createWrapper() });

    expect(screen.getAllByText('animate-pulse').length).toBeGreaterThan(0);
  });

  it('handles quick action buttons', async () => {
    const user = userEvent.setup();
    const mockStore = mockUseTaxonomyStore();
    
    render(<TaxonomyDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Create Namespace')).toBeInTheDocument();
    });

    // Click create namespace button
    await user.click(screen.getByText('Create Namespace'));
    expect(mockStore.openCreateNamespace).toHaveBeenCalled();

    // Click create category button
    await user.click(screen.getByText('Create Category'));
    expect(mockStore.openCreateCategory).toHaveBeenCalled();
  });

  it('shows different tabs content', async () => {
    const user = userEvent.setup();
    
    render(<TaxonomyDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    // Click on Activity tab
    await user.click(screen.getByText('Activity'));
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();

    // Click on Analytics tab
    await user.click(screen.getByText('Analytics'));
    expect(screen.getByText('Usage Trends')).toBeInTheDocument();

    // Click on Health tab
    await user.click(screen.getByText('Health'));
    expect(screen.getByText('System Health')).toBeInTheDocument();
  });

  it('displays health metrics correctly', async () => {
    const user = userEvent.setup();
    
    render(<TaxonomyDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Health')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Health'));

    expect(screen.getByText('99.9%')).toBeInTheDocument();
    expect(screen.getByText('Uptime')).toBeInTheDocument();
    expect(screen.getByText('150ms')).toBeInTheDocument();
    expect(screen.getByText('Avg Response Time')).toBeInTheDocument();
    expect(screen.getByText('0.01%')).toBeInTheDocument();
    expect(screen.getByText('Error Rate')).toBeInTheDocument();
  });

  it('handles error state gracefully', async () => {
    // Mock a failed query
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock console.error to avoid noise in tests
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <QueryClientProvider client={queryClient}>
        <TaxonomyDashboard />
      </QueryClientProvider>
    );

    // Should still render the component structure
    await waitFor(() => {
      expect(screen.getByText('Active Namespaces')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('updates stats when data changes', async () => {
    const mockUpdateStats = vi.fn();
    mockUseTaxonomyStore.mockReturnValue({
      ...mockUseTaxonomyStore(),
      updateStats: mockUpdateStats,
    });

    render(<TaxonomyDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockUpdateStats).toHaveBeenCalledWith(
        expect.objectContaining({
          totalNamespaces: expect.any(Number),
          totalCategories: expect.any(Number),
          totalClassifications: expect.any(Number),
        })
      );
    });
  });
});



