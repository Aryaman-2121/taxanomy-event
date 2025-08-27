/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Category Create Form Stories - Storybook
 * Template: Eventzr Code Repository Template v1.0
 */

import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { within, userEvent, expect } from '@storybook/test';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CategoryCreateForm } from '@/components/forms/category-create-form';

// Mock store for Storybook
const mockStore = {
  addNotification: action('addNotification'),
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: Infinity },
    mutations: { retry: false },
  },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <div className="max-w-4xl mx-auto p-6 bg-background">
      {children}
    </div>
  </QueryClientProvider>
);

const meta: Meta<typeof CategoryCreateForm> = {
  title: 'Forms/CategoryCreateForm',
  component: CategoryCreateForm,
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
        component: 'Form component for creating new taxonomy categories with validation and preview.',
      },
    },
  },
  args: {
    onSuccess: action('onSuccess'),
    onCancel: action('onCancel'),
  },
  argTypes: {
    onSuccess: { action: 'onSuccess' },
    onCancel: { action: 'onCancel' },
    defaultNamespace: {
      control: 'text',
      description: 'Pre-selected namespace ID',
    },
    defaultEntityType: {
      control: 'select',
      options: ['', 'events', 'venues', 'content', 'services'],
      description: 'Pre-selected entity type',
    },
    defaultParentId: {
      control: 'text',
      description: 'Pre-selected parent category ID',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CategoryCreateForm>;

export const Default: Story = {
  args: {},
};

export const WithDefaults: Story = {
  args: {
    defaultNamespace: 'events-namespace',
    defaultEntityType: 'events',
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with pre-selected namespace and entity type.',
      },
    },
  },
};

export const WithParent: Story = {
  args: {
    defaultNamespace: 'events-namespace',
    defaultEntityType: 'events',
    defaultParentId: 'music-events',
  },
  parameters: {
    docs: {
      description: {
        story: 'Form configured to create a subcategory under a specific parent.',
      },
    },
  },
};

export const WithCancel: Story = {
  args: {
    onCancel: action('onCancel'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing the cancel button when onCancel prop is provided.',
      },
    },
  },
};

export const Mobile: Story = {
  args: {
    defaultNamespace: 'events-namespace',
    defaultEntityType: 'events',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Form optimized for mobile devices with responsive layout.',
      },
    },
  },
};

export const ValidationStates: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Try to submit without filling required fields
    const submitButton = canvas.getByText('Create Category');
    await userEvent.click(submitButton);
    
    // Should show validation errors
    await expect(canvas.getByText('Namespace is required')).toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates form validation states and error messages.',
      },
    },
  },
};

export const FilledForm: Story = {
  args: {
    defaultNamespace: 'events-namespace',
    defaultEntityType: 'events',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Fill out the form
    await userEvent.type(canvas.getByLabelText('Display Name'), 'Rock Music Events');
    await userEvent.type(canvas.getByLabelText('Description (Optional)'), 'Live rock music performances and concerts');
    await userEvent.type(canvas.getByLabelText('Sort Order'), '10');
    
    // Should show preview
    await expect(canvas.getByText('Preview')).toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with filled data showing the preview functionality.',
      },
    },
  },
};

export const DarkMode: Story = {
  args: {
    defaultNamespace: 'events-namespace',
    defaultEntityType: 'events',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Form with dark theme applied.',
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

export const Loading: Story = {
  args: {
    defaultNamespace: 'events-namespace',
    defaultEntityType: 'events',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Fill required fields
    await userEvent.type(canvas.getByLabelText('Display Name'), 'Test Category');
    
    // Submit form to show loading state
    const submitButton = canvas.getByText('Create Category');
    await userEvent.click(submitButton);
  },
  parameters: {
    docs: {
      description: {
        story: 'Form in loading state after submission.',
      },
    },
  },
};
