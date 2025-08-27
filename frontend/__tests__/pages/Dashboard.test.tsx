/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import DashboardPage from '../../src/app/page';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock the dashboard components
vi.mock('@/components/layout/dashboard-header', () => ({
  DashboardHeader: () => <div data-testid="dashboard-header">Dashboard Header</div>,
}));

vi.mock('@/components/performance/performance-metrics', () => ({
  PerformanceMetrics: () => <div data-testid="performance-metrics">Performance Metrics</div>,
}));

vi.mock('@/components/taxonomy/taxonomy-overview', () => ({
  TaxonomyOverview: () => <div data-testid="taxonomy-overview">Taxonomy Overview</div>,
}));

// Mock API calls
const mockApiGet = vi.fn();
vi.mock('@/lib/api/client', () => ({
  taxonomyApi: {
    get: mockApiGet,
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
};

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  it('renders dashboard page without crashing', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Taxonomy Dashboard')).toBeInTheDocument();
  });

  it('displays welcome message', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText(/Welcome to the Taxonomy Management System/i)).toBeInTheDocument();
  });

  it('shows overview statistics cards', async () => {
    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Namespaces')).toBeInTheDocument();
      expect(screen.getByText('Total Categories')).toBeInTheDocument();
      expect(screen.getByText('Total Classifications')).toBeInTheDocument();
      expect(screen.getByText('Active Classifications')).toBeInTheDocument();
    });
  });

  it('displays recent activity section', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('shows quick actions section', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Create Namespace')).toBeInTheDocument();
    expect(screen.getByText('Add Category')).toBeInTheDocument();
    expect(screen.getByText('Search Taxonomy')).toBeInTheDocument();
  });

  it('displays taxonomy health status', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('System Health')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<DashboardPage />);
    
    // Should show loading indicators for data that needs to be fetched
    const loadingElements = screen.getAllByTestId(/loading/i);
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('handles navigation to namespaces page', async () => {
    render(<DashboardPage />);
    
    const namespacesLink = screen.getByText('View All Namespaces');
    fireEvent.click(namespacesLink);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/namespaces');
    });
  });

  it('handles navigation to categories page', async () => {
    render(<DashboardPage />);
    
    const categoriesLink = screen.getByText('View All Categories');
    fireEvent.click(categoriesLink);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/categories');
    });
  });

  it('handles navigation to search page', async () => {
    render(<DashboardPage />);
    
    const searchButton = screen.getByText('Search Taxonomy');
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/search');
    });
  });

  it('displays error state when API fails', async () => {
    // Mock API failure
    mockApiGet.mockRejectedValue(new Error('API Error'));
    
    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error loading dashboard data/i)).toBeInTheDocument();
    });
  });

  it('shows retry button on error', async () => {
    mockApiGet.mockRejectedValue(new Error('API Error'));
    
    render(<DashboardPage />);
    
    await waitFor(() => {
      const retryButton = screen.getByText('Retry');
      expect(retryButton).toBeInTheDocument();
    });
  });

  it('retries loading data when retry button is clicked', async () => {
    mockApiGet.mockRejectedValue(new Error('API Error'));
    
    render(<DashboardPage />);
    
    await waitFor(() => {
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);
      expect(mockApiGet).toHaveBeenCalledTimes(2); // Initial call + retry
    });
  });

  it('displays correct metrics when data is loaded', async () => {
    mockApiGet.mockResolvedValue({
      success: true,
      data: {
        namespaces: 5,
        categories: 25,
        classifications: 150,
        active_classifications: 145,
      },
    });
    
    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // namespaces count
      expect(screen.getByText('25')).toBeInTheDocument(); // categories count
      expect(screen.getByText('150')).toBeInTheDocument(); // classifications count
      expect(screen.getByText('145')).toBeInTheDocument(); // active classifications count
    });
  });

  it('shows performance metrics component', () => {
    render(<DashboardPage />);
    
    expect(screen.getByTestId('performance-metrics')).toBeInTheDocument();
  });

  it('shows taxonomy overview component', () => {
    render(<DashboardPage />);
    
    expect(screen.getByTestId('taxonomy-overview')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<DashboardPage />);
    
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('is responsive and mobile-friendly', () => {
    render(<DashboardPage />);
    
    const container = screen.getByTestId('dashboard-container');
    expect(container).toHaveClass('container');
  });
});
