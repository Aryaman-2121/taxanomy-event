/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Taxonomy Dashboard Stories - Storybook
 * Template: Eventzr Code Repository Template v1.0
 */

import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TaxonomyDashboard } from '@/components/taxonomy/taxonomy-dashboard';

// Mock the taxonomy store
const mockStore = {
  stats: {
    totalNamespaces: 12,
    totalCategories: 1247,
    totalClassifications: 8532,
    monthlyGrowth: {
      namespaces: 8.3,
      categories: 12.5,
      classifications: 15.7,
    },
    topCategories: [
      { id: '1', name: 'music_events', count: 456 },
      { id: '2', name: 'sports_events', count: 321 },
      { id: '3', name: 'business_events', count: 234 },
    ],
    lastUpdated: Date.now(),
  },
  updateStats: () => {},
  openCreateNamespace: () => console.log('Open create namespace'),
  openCreateCategory: () => console.log('Open create category'),
  openCreateClassification: () => console.log('Open create classification'),
  openBulkOperations: () => console.log('Open bulk operations'),
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: Infinity },
    mutations: { retry: false },
  },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <div className="min-h-screen bg-background p-6">
      {children}
    </div>
  </QueryClientProvider>
);

const meta: Meta<typeof TaxonomyDashboard> = {
  title: 'Components/TaxonomyDashboard',
  component: TaxonomyDashboard,
  decorators: [
    (Story) => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The main dashboard component showing taxonomy statistics and management tools.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TaxonomyDashboard>;

export const Default: Story = {
  args: {},
};

export const WithHighGrowth: Story = {
  args: {},
  decorators: [
    (Story) => {
      const highGrowthMockStore = {
        ...mockStore,
        stats: {
          ...mockStore.stats,
          monthlyGrowth: {
            namespaces: 25.5,
            categories: 45.2,
            classifications: 67.8,
          },
        },
      };

      return (
        <Wrapper>
          <Story />
        </Wrapper>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story: 'Dashboard showing high growth metrics with increased percentages.',
      },
    },
  },
};

export const WithLowStats: Story = {
  args: {},
  decorators: [
    (Story) => {
      const lowStatsMockStore = {
        ...mockStore,
        stats: {
          totalNamespaces: 2,
          totalCategories: 45,
          totalClassifications: 123,
          monthlyGrowth: {
            namespaces: 0.0,
            categories: -2.1,
            classifications: 3.4,
          },
          topCategories: [
            { id: '1', name: 'basic_events', count: 12 },
          ],
          lastUpdated: Date.now(),
        },
      };

      return (
        <Wrapper>
          <Story />
        </Wrapper>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story: 'Dashboard for a new installation with minimal data and negative growth in some areas.',
      },
    },
  },
};

export const LoadingState: Story = {
  args: {},
  decorators: [
    (Story) => {
      // Create a query client that never resolves to show loading state
      const loadingQueryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: 0 },
        },
      });

      return (
        <QueryClientProvider client={loadingQueryClient}>
          <div className="min-h-screen bg-background p-6">
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story: 'Dashboard in loading state with skeleton placeholders.',
      },
    },
  },
};

export const Mobile: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Dashboard optimized for mobile viewing with responsive layout.',
      },
    },
  },
};

export const DarkMode: Story = {
  args: {},
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Dashboard with dark theme applied.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Wrapper>
          <Story />
        </Wrapper>
      </div>
    ),
  ],
};
