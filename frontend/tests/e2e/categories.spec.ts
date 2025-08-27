/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * E2E tests for the categories page
 */

import { test, expect } from '@playwright/test';

test.describe('Categories Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/v1/taxonomy/categories*', async (route) => {
      const url = route.request().url();
      const urlObj = new URL(url);
      const page_param = urlObj.searchParams.get('page') || '1';
      const search = urlObj.searchParams.get('search');
      
      let categories = [
        {
          id: '1',
          name: 'Animals',
          description: 'Animal kingdom classification',
          taxonomyId: '1',
          parentId: null,
          level: 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          children: [
            {
              id: '3',
              name: 'Mammals',
              description: 'Mammalian species',
              taxonomyId: '1',
              parentId: '1',
              level: 1,
              createdAt: '2024-01-01T00:00:00Z'
            }
          ]
        },
        {
          id: '2',
          name: 'Plants',
          description: 'Plant kingdom classification',
          taxonomyId: '1',
          parentId: null,
          level: 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          children: []
        }
      ];

      // Filter by search if provided
      if (search) {
        categories = categories.filter(cat => 
          cat.name.toLowerCase().includes(search.toLowerCase()) ||
          cat.description.toLowerCase().includes(search.toLowerCase())
        );
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: categories,
          pagination: {
            page: parseInt(page_param),
            limit: 10,
            total: categories.length,
            totalPages: Math.ceil(categories.length / 10)
          }
        })
      });
    });

    await page.route('**/v1/taxonomy/categories/*', async (route) => {
      const id = route.request().url().split('/').pop();
      
      const category = {
        id,
        name: id === '1' ? 'Animals' : 'Plants',
        description: id === '1' ? 'Animal kingdom classification' : 'Plant kingdom classification',
        taxonomyId: '1',
        parentId: null,
        level: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: category
        })
      });
    });

    await page.route('**/v1/taxonomy/taxonomies*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: '1',
              name: 'Biology',
              description: 'Biological classification system',
              version: '1.0.0',
              namespaceId: 'bio'
            }
          ]
        })
      });
    });

    // Navigate to categories page
    await page.goto('/categories');
  });

  test('displays categories page layout', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Categories/);

    // Check page header
    await expect(page.locator('h1')).toContainText('Categories');

    // Check create category button
    await expect(page.locator('[data-testid="create-category-button"]')).toBeVisible();

    // Check search input
    await expect(page.locator('[data-testid="category-search"]')).toBeVisible();
  });

  test('lists categories with correct data', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');

    // Check categories are displayed
    const categoryCards = page.locator('[data-testid="category-card"]');
    await expect(categoryCards).toHaveCount(2);

    // Check first category
    const firstCard = categoryCards.first();
    await expect(firstCard.locator('[data-testid="category-name"]')).toContainText('Animals');
    await expect(firstCard.locator('[data-testid="category-description"]')).toContainText('Animal kingdom classification');
  });

  test('searches categories', async ({ page }) => {
    // Wait for initial load
    await page.waitForLoadState('networkidle');

    // Enter search term
    const searchInput = page.locator('[data-testid="category-search"]');
    await searchInput.fill('animal');
    
    // Wait for search to trigger
    await page.waitForTimeout(500);

    // Check filtered results
    const categoryCards = page.locator('[data-testid="category-card"]');
    await expect(categoryCards).toHaveCount(1);
    await expect(categoryCards.first().locator('[data-testid="category-name"]')).toContainText('Animals');
  });

  test('clears search results', async ({ page }) => {
    // Wait for initial load
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('[data-testid="category-search"]');
    
    // Search for something
    await searchInput.fill('animal');
    await page.waitForTimeout(500);

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);

    // All categories should be visible again
    const categoryCards = page.locator('[data-testid="category-card"]');
    await expect(categoryCards).toHaveCount(2);
  });

  test('creates new category', async ({ page }) => {
    // Mock create category API
    await page.route('**/v1/taxonomy/categories', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: '4',
              name: 'New Category',
              description: 'Test category',
              taxonomyId: '1',
              parentId: null,
              level: 0,
              createdAt: new Date().toISOString()
            }
          })
        });
      }
    });

    // Click create button
    await page.click('[data-testid="create-category-button"]');

    // Check modal/form is visible
    await expect(page.locator('[data-testid="category-form"]')).toBeVisible();

    // Fill out form
    await page.fill('[data-testid="category-name-input"]', 'New Category');
    await page.fill('[data-testid="category-description-input"]', 'Test category');
    
    // Select taxonomy if dropdown exists
    const taxonomySelect = page.locator('[data-testid="taxonomy-select"]');
    if (await taxonomySelect.isVisible()) {
      await taxonomySelect.selectOption('1');
    }

    // Submit form
    await page.click('[data-testid="submit-category-button"]');

    // Check success message or updated list
    const successMessage = page.locator('[data-testid="success-message"]');
    if (await successMessage.isVisible()) {
      await expect(successMessage).toContainText('Category created successfully');
    }
  });

  test('views category details', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');

    // Click on first category
    await page.click('[data-testid="category-card"]:first-child [data-testid="view-category-button"]');

    // Check if modal or detail page opens
    const detailModal = page.locator('[data-testid="category-detail-modal"]');
    const detailPage = page.locator('[data-testid="category-detail-page"]');
    
    const hasModal = await detailModal.isVisible();
    const hasDetailPage = await detailPage.isVisible();
    
    expect(hasModal || hasDetailPage).toBeTruthy();

    if (hasModal) {
      await expect(detailModal.locator('[data-testid="category-name"]')).toContainText('Animals');
    } else if (hasDetailPage) {
      await expect(page).toHaveURL(/\/categories\/1/);
      await expect(page.locator('h1')).toContainText('Animals');
    }
  });

  test('edits category', async ({ page }) => {
    // Mock update category API
    await page.route('**/v1/taxonomy/categories/1', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: '1',
              name: 'Updated Animals',
              description: 'Updated animal kingdom classification',
              taxonomyId: '1',
              parentId: null,
              level: 0,
              updatedAt: new Date().toISOString()
            }
          })
        });
      }
    });

    // Wait for data to load
    await page.waitForLoadState('networkidle');

    // Click edit button on first category
    await page.click('[data-testid="category-card"]:first-child [data-testid="edit-category-button"]');

    // Check edit form is visible
    await expect(page.locator('[data-testid="category-edit-form"]')).toBeVisible();

    // Update name
    const nameInput = page.locator('[data-testid="category-name-input"]');
    await nameInput.clear();
    await nameInput.fill('Updated Animals');

    // Submit changes
    await page.click('[data-testid="save-category-button"]');

    // Check success message
    const successMessage = page.locator('[data-testid="success-message"]');
    if (await successMessage.isVisible()) {
      await expect(successMessage).toContainText('Category updated successfully');
    }
  });

  test('deletes category', async ({ page }) => {
    // Mock delete category API
    await page.route('**/v1/taxonomy/categories/1', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true
          })
        });
      }
    });

    // Wait for data to load
    await page.waitForLoadState('networkidle');

    // Click delete button on first category
    await page.click('[data-testid="category-card"]:first-child [data-testid="delete-category-button"]');

    // Check confirmation dialog
    await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="delete-confirmation"]')).toContainText('Are you sure');

    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]');

    // Check success message
    const successMessage = page.locator('[data-testid="success-message"]');
    if (await successMessage.isVisible()) {
      await expect(successMessage).toContainText('Category deleted successfully');
    }
  });

  test('displays category hierarchy', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');

    // Check for hierarchical display
    const categoryTree = page.locator('[data-testid="category-tree"]');
    if (await categoryTree.isVisible()) {
      // Check parent categories
      await expect(categoryTree.locator('[data-testid="parent-category"]')).toHaveCount(2);
      
      // Check child categories
      const childCategories = categoryTree.locator('[data-testid="child-category"]');
      if (await childCategories.count() > 0) {
        await expect(childCategories.first()).toContainText('Mammals');
      }
    }
  });

  test('filters by taxonomy', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');

    // Check taxonomy filter
    const taxonomyFilter = page.locator('[data-testid="taxonomy-filter"]');
    if (await taxonomyFilter.isVisible()) {
      await taxonomyFilter.selectOption('1');
      await page.waitForTimeout(500);

      // Categories should be filtered by taxonomy
      const categoryCards = page.locator('[data-testid="category-card"]');
      await expect(categoryCards).toHaveCount(2);
    }
  });

  test('handles pagination', async ({ page }) => {
    // Mock paginated response
    await page.route('**/v1/taxonomy/categories*', async (route) => {
      const url = route.request().url();
      const urlObj = new URL(url);
      const page_param = parseInt(urlObj.searchParams.get('page') || '1');
      
      const allCategories = Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Category ${i + 1}`,
        description: `Description for category ${i + 1}`,
        taxonomyId: '1',
        parentId: null,
        level: 0,
        createdAt: '2024-01-01T00:00:00Z'
      }));

      const pageSize = 10;
      const startIndex = (page_param - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const pageCategories = allCategories.slice(startIndex, endIndex);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: pageCategories,
          pagination: {
            page: page_param,
            limit: pageSize,
            total: allCategories.length,
            totalPages: Math.ceil(allCategories.length / pageSize)
          }
        })
      });
    });

    await page.goto('/categories');
    await page.waitForLoadState('networkidle');

    // Check pagination controls
    const pagination = page.locator('[data-testid="pagination"]');
    if (await pagination.isVisible()) {
      // Check next page button
      const nextButton = pagination.locator('[data-testid="next-page"]');
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForLoadState('networkidle');
        
        // Check URL or page indicator updated
        const pageIndicator = page.locator('[data-testid="current-page"]');
        if (await pageIndicator.isVisible()) {
          await expect(pageIndicator).toContainText('2');
        }
      }
    }
  });

  test('handles loading states', async ({ page }) => {
    // Navigate to page
    await page.goto('/categories');

    // Check for loading indicators
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    const skeletonLoader = page.locator('[data-testid="skeleton-loader"]');
    
    // Loading should appear briefly
    const hasSpinner = await loadingSpinner.isVisible({ timeout: 1000 });
    const hasSkeleton = await skeletonLoader.isVisible({ timeout: 1000 });
    
    if (hasSpinner || hasSkeleton) {
      // Wait for loading to complete
      await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });
      await expect(skeletonLoader).not.toBeVisible({ timeout: 5000 });
    }

    // Content should be visible after loading
    await expect(page.locator('[data-testid="categories-list"]')).toBeVisible();
  });

  test('handles error states', async ({ page }) => {
    // Mock API error
    await page.route('**/v1/taxonomy/categories*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal server error'
        })
      });
    });

    await page.goto('/categories');
    await page.waitForLoadState('networkidle');

    // Check for error message
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/error|failed|something went wrong/i);

    // Check for retry button
    const retryButton = page.locator('[data-testid="retry-button"]');
    if (await retryButton.isVisible()) {
      await expect(retryButton).toBeVisible();
    }
  });

  test('is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/categories');
    await page.waitForLoadState('networkidle');

    // Check mobile layout
    await expect(page.locator('h1')).toBeVisible();
    
    // Categories should be in single column on mobile
    const categoryCards = page.locator('[data-testid="category-card"]');
    if (await categoryCards.count() > 0) {
      const firstCard = categoryCards.first();
      const secondCard = categoryCards.nth(1);
      
      if (await secondCard.isVisible()) {
        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();
        
        // Cards should be stacked vertically (second card below first)
        expect(secondBox!.y).toBeGreaterThan(firstBox!.y + firstBox!.height - 10);
      }
    }
  });
});
