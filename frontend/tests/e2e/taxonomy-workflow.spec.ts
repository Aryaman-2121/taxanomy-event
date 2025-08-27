/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * E2E Tests - Complete Taxonomy Workflow
 * Template: Eventzr Code Repository Template v1.0
 */

import { test, expect } from '@playwright/test';

test.describe('Taxonomy Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('auth-store', JSON.stringify({
        state: {
          user: {
            id: 'test-user',
            email: 'test@eventzr.com',
            name: 'Test User',
            tenant_id: 'test-tenant',
            role: 'admin',
            permissions: ['taxonomy:read', 'taxonomy:write', 'taxonomy:admin'],
          },
          token: 'mock-jwt-token',
          isAuthenticated: true,
        },
        version: 0,
      }));
    });

    await page.goto('/');
  });

  test('should display dashboard with stats', async ({ page }) => {
    // Wait for page to load
    await expect(page.getByText('Taxonomy Management')).toBeVisible();

    // Check stats cards are present
    await expect(page.getByText('Active Namespaces')).toBeVisible();
    await expect(page.getByText('Total Categories')).toBeVisible();
    await expect(page.getByText('Active Classifications')).toBeVisible();
    await expect(page.getByText('Monthly API Calls')).toBeVisible();

    // Check that numbers are displayed
    await expect(page.locator('[class*="text-3xl font-bold"]').first()).toBeVisible();
  });

  test('should navigate between different sections', async ({ page }) => {
    // Navigate to namespaces
    await page.getByText('Namespaces').click();
    await expect(page).toHaveURL(/.*\/namespaces/);
    await expect(page.getByText('Manage and organize your taxonomy namespaces')).toBeVisible();

    // Navigate to categories
    await page.getByText('Categories').click();
    await expect(page).toHaveURL(/.*\/categories/);
    await expect(page.getByText('Manage hierarchical categories')).toBeVisible();

    // Navigate to classifications
    await page.getByText('Classifications').click();
    await expect(page).toHaveURL(/.*\/classifications/);
    await expect(page.getByText('Manage entity-category assignments')).toBeVisible();

    // Navigate to search
    await page.getByText('Search').click();
    await expect(page).toHaveURL(/.*\/search/);
    await expect(page.getByText('Search Taxonomies')).toBeVisible();
  });

  test('should handle namespace creation workflow', async ({ page }) => {
    await page.getByText('Namespaces').click();
    
    // Open create namespace dialog
    await page.getByText('Create Namespace').click();
    
    // Fill namespace form
    await page.getByLabel('Name').fill('test_namespace');
    await page.getByLabel('Display Name').fill('Test Namespace');
    await page.getByLabel('Description').fill('A test namespace for automated testing');
    
    // Submit form
    await page.getByText('Create Namespace').click();
    
    // Verify success message or redirect
    await expect(page.getByText('Namespace created successfully')).toBeVisible();
  });

  test('should handle category tree interaction', async ({ page }) => {
    await page.getByText('Categories').click();
    
    // Select namespace and entity type
    await page.getByText('events').click();
    await page.getByText('events').click(); // Select entity type
    
    // Wait for tree to load
    await expect(page.getByText('Music Events')).toBeVisible();
    
    // Expand category
    await page.locator('[data-testid="expand-button"]').first().click();
    
    // Check subcategories appear
    await expect(page.getByText('Rock Concerts')).toBeVisible();
    
    // Select a category
    await page.getByText('Rock Concerts').click();
    
    // Verify details panel updates
    await expect(page.getByText('Category Details')).toBeVisible();
  });

  test('should handle search functionality', async ({ page }) => {
    await page.getByText('Search').click();
    
    // Perform search
    await page.getByPlaceholder('Search taxonomies').fill('music');
    await page.keyboard.press('Enter');
    
    // Verify search results
    await expect(page.getByText('Search Results')).toBeVisible();
    await expect(page.getByText('Music Events')).toBeVisible();
    
    // Test filters
    await page.getByText('Categories').check();
    await expect(page.getByText('Filter applied')).toBeVisible();
  });

  test('should handle mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check mobile navigation
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Namespaces')).toBeVisible();
    
    // Navigate on mobile
    await page.getByText('Categories').click();
    await expect(page).toHaveURL(/.*\/categories/);
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/categories');
    
    // Should show error state
    await expect(page.getByText('Failed to load')).toBeVisible();
    
    // Should provide retry option
    await expect(page.getByText('Try again')).toBeVisible();
  });

  test('should persist UI state across page reloads', async ({ page }) => {
    await page.getByText('Categories').click();
    
    // Expand a category
    await page.locator('[data-testid="expand-button"]').first().click();
    await expect(page.getByText('Rock Concerts')).toBeVisible();
    
    // Reload page
    await page.reload();
    
    // Check if expansion state persists
    await expect(page.getByText('Rock Concerts')).toBeVisible();
  });

  test('should handle bulk operations', async ({ page }) => {
    await page.getByText('Categories').click();
    
    // Enable bulk action mode
    await page.getByText('Bulk Actions').click();
    
    // Select multiple items
    await page.locator('[data-testid="select-checkbox"]').first().check();
    await page.locator('[data-testid="select-checkbox"]').nth(1).check();
    
    // Perform bulk action
    await page.getByText('Export Selected').click();
    
    // Verify bulk action completed
    await expect(page.getByText('Export completed')).toBeVisible();
  });

  test('should validate form inputs correctly', async ({ page }) => {
    await page.getByText('Categories').click();
    await page.getByText('Create Category').click();
    
    // Try to submit empty form
    await page.getByText('Create Category').click();
    
    // Check validation errors
    await expect(page.getByText('Namespace is required')).toBeVisible();
    await expect(page.getByText('Display name is required')).toBeVisible();
    
    // Fill with invalid data
    await page.getByLabel('Internal Name').fill('Invalid Name!');
    
    // Check validation message
    await expect(page.getByText('must be lowercase alphanumeric')).toBeVisible();
  });

  test('should handle real-time updates', async ({ page }) => {
    await page.goto('/');
    
    // Check initial stats
    const initialCount = await page.getByText('1,247').textContent();
    
    // Simulate real-time update (in a real app, this would come from websockets)
    await page.evaluate(() => {
      // Simulate store update
      window.dispatchEvent(new CustomEvent('stats-update', {
        detail: { totalCategories: 1248 }
      }));
    });
    
    // Verify stats updated (mock scenario)
    // In real implementation, this would test actual websocket updates
  });
});

test.describe('Accessibility Tests', () => {
  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should navigate properly
    await expect(page).toHaveURL(/.*\/namespaces/);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check for ARIA labels
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('button', { name: /create/i })).toBeVisible();
  });

  test('should work with screen readers', async ({ page }) => {
    await page.goto('/categories');
    
    // Check for semantic headings
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
    
    // Check for proper labeling
    await expect(page.getByLabel(/search categories/i)).toBeVisible();
  });
});

test.describe('Performance Tests', () => {
  test('should load dashboard quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await expect(page.getByText('Taxonomy Management')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
  });

  test('should handle large category trees efficiently', async ({ page }) => {
    await page.goto('/categories');
    
    // Mock large dataset response
    await page.route('**/categories/tree**', route => {
      const mockData = Array.from({ length: 1000 }, (_, i) => ({
        id: `category-${i}`,
        name: `category_${i}`,
        display_name: `Category ${i}`,
        children: []
      }));
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockData })
      });
    });
    
    // Should render without performance issues
    await expect(page.getByText('Category 0')).toBeVisible();
    await expect(page.getByText('Category 999')).toBeVisible();
  });
});

