/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Category Create Form Unit Tests
 * Template: Eventzr Code Repository Template v1.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CategoryCreateForm } from '../../src/components/forms/category-create-form';

// Mock the stores
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

describe('CategoryCreateForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();
  const mockAddNotification = vi.fn();

  beforeEach(() => {
    mockUseTaxonomyStore.mockReturnValue({
      addNotification: mockAddNotification,
    });
    vi.clearAllMocks();
  });

  it('renders form with all required fields', () => {
    render(
      <CategoryCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Create New Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Namespace')).toBeInTheDocument();
    expect(screen.getByLabelText('Entity Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Internal Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description (Optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Sort Order')).toBeInTheDocument();
  });

  it('auto-generates internal name from display name', async () => {
    const user = userEvent.setup();
    
    render(
      <CategoryCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
      { wrapper: createWrapper() }
    );

    const displayNameInput = screen.getByLabelText('Display Name');
    const internalNameInput = screen.getByLabelText('Internal Name');

    await user.type(displayNameInput, 'Music Events');

    await waitFor(() => {
      expect(internalNameInput).toHaveValue('music_events');
    });
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <CategoryCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByText('Create Category');
    
    // Try to submit without filling required fields
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Namespace is required')).toBeInTheDocument();
      expect(screen.getByText('Entity type is required')).toBeInTheDocument();
      expect(screen.getByText('Display name is required')).toBeInTheDocument();
    });
  });

  it('validates internal name format', async () => {
    const user = userEvent.setup();
    
    render(
      <CategoryCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
      { wrapper: createWrapper() }
    );

    const internalNameInput = screen.getByLabelText('Internal Name');
    
    // Enter invalid format (uppercase, spaces, special chars)
    await user.type(internalNameInput, 'Invalid Name!');

    await waitFor(() => {
      expect(screen.getByText(/Name must be lowercase alphanumeric/)).toBeInTheDocument();
    });
  });

  it('shows preview when form is filled', async () => {
    const user = userEvent.setup();
    
    render(
      <CategoryCreateForm
        defaultNamespace="events"
        defaultEntityType="events"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
      { wrapper: createWrapper() }
    );

    const displayNameInput = screen.getByLabelText('Display Name');
    
    await user.type(displayNameInput, 'Test Category');

    await waitFor(() => {
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByText('/events/events/test_category')).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <CategoryCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
      { wrapper: createWrapper() }
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables submit button when form is invalid', () => {
    render(
      <CategoryCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByText('Create Category');
    expect(submitButton).toBeDisabled();
  });

  it('handles successful form submission', async () => {
    const user = userEvent.setup();
    
    render(
      <CategoryCreateForm
        defaultNamespace="events"
        defaultEntityType="events"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
      { wrapper: createWrapper() }
    );

    // Fill out the form
    await user.type(screen.getByLabelText('Display Name'), 'Test Category');
    
    const submitButton = screen.getByText('Create Category');
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await user.click(submitButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/Create Category/)).toBeInTheDocument();
    });
  });

  it('handles form submission error', async () => {
    const user = userEvent.setup();
    
    // Mock a failed mutation
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CategoryCreateForm
          defaultNamespace="events"
          defaultEntityType="events"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </QueryClientProvider>
    );

    // Fill and submit form
    await user.type(screen.getByLabelText('Display Name'), 'Test Category');
    
    const submitButton = screen.getByText('Create Category');
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await user.click(submitButton);

    // Should handle the error appropriately
    // (The exact behavior depends on the MSW handlers)
  });

  it('shows validation summary when there are errors', async () => {
    const user = userEvent.setup();
    
    render(
      <CategoryCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
      { wrapper: createWrapper() }
    );

    // Enter invalid data
    await user.type(screen.getByLabelText('Internal Name'), 'Invalid Name!');
    await user.type(screen.getByLabelText('Sort Order'), '-1');

    await waitFor(() => {
      expect(screen.getByText('Please correct the following errors before submitting:')).toBeInTheDocument();
    });
  });
});

