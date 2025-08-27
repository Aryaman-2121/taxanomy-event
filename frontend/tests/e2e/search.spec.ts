/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * E2E tests for the search functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Search Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock search API responses
    await page.route('**/v1/taxonomy/search*', async (route) => {
      const url = route.request().url();
      const urlObj = new URL(url);
      const query = urlObj.searchParams.get('q') || '';
      const type = urlObj.searchParams.get('type') || 'all';
      const page_param = urlObj.searchParams.get('page') || '1';

      let results: any[] = [];

      if (query) {
        const mockResults = [
          {
            id: '1',
            type: 'taxonomy',
            name: 'Biology',
            description: 'Biological classification system',
            score: 0.95,
            metadata: {
              version: '1.0.0',
              namespaceId: 'bio'
            }
          },
          {
            id: '1',
            type: 'category',
            name: 'Animals',
            description: 'Animal kingdom classification',
            score: 0.87,
            metadata: {
              taxonomyId: '1',
              level: 0
            }
          },
          {
            id: '3',
            type: 'category',
            name: 'Mammals',
            description: 'Mammalian species classification',
            score: 0.76,
            metadata: {
              taxonomyId: '1',
              parentId: '1',
              level: 1
            }
          },
          {
            id: 'bio',
            type: 'namespace',
            name: 'Biology Namespace',
            description: 'Biological sciences namespace',
            score: 0.82,
            metadata: {}
          }
        ];

        // Filter by query
        results = mockResults.filter(item =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
        );

        // Filter by type
        if (type !== 'all') {
          results = results.filter(item => item.type === type);
        }

        // Sort by score
        results.sort((a, b) => b.score - a.score);
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            results,
            totalCount: results.length,
            query,
            type,
            pagination: {
              page: parseInt(page_param),
              limit: 20,
              total: results.length,
              totalPages: Math.ceil(results.length / 20)
            }
          }
        })
      });
    });

    // Mock suggestions API
    await page.route('**/v1/taxonomy/search/suggestions*', async (route) => {
      const url = route.request().url();
      const urlObj = new URL(url);
      const query = urlObj.searchParams.get('q') || '';

      const suggestions = query ? [
        'biology',
        'biological classification',
        'animals',
        'mammals',
        'plants'
      ].filter(s => s.includes(query.toLowerCase())).slice(0, 5) : [];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: suggestions
        })
      });
    });

    // Navigate to search page
    await page.goto('/search');
  });

  test('displays search page layout', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Search/);

    // Check search input
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();

    // Check search button
    await expect(page.locator('[data-testid="search-button"]')).toBeVisible();

    // Check type filters
    await expect(page.locator('[data-testid="search-filters"]')).toBeVisible();
  });

  test('performs basic search', async ({ page }) => {
    // Enter search query
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('biology');
    
    // Submit search
    await page.click('[data-testid="search-button"]');
    
    // Wait for results
    await page.waitForLoadState('networkidle');

    // Check results are displayed
    const searchResults = page.locator('[data-testid="search-results"]');
    await expect(searchResults).toBeVisible();

    // Check result items
    const resultItems = page.locator('[data-testid="search-result-item"]');
    await expect(resultItems).toHaveCount(4);

    // Check first result
    const firstResult = resultItems.first();
    await expect(firstResult.locator('[data-testid="result-name"]')).toContainText('Biology');
    await expect(firstResult.locator('[data-testid="result-type"]')).toContainText('taxonomy');
  });

  test('searches with Enter key', async ({ page }) => {
    // Enter search query
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('animals');
    
    // Press Enter
    await searchInput.press('Enter');
    
    // Wait for results
    await page.waitForLoadState('networkidle');

    // Check results are displayed
    const resultItems = page.locator('[data-testid="search-result-item"]');
    await expect(resultItems).toHaveCount(1);
    await expect(resultItems.first().locator('[data-testid="result-name"]')).toContainText('Animals');
  });

  test('displays search suggestions', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Start typing
    await searchInput.fill('bio');
    
    // Wait for suggestions
    await page.waitForTimeout(300);

    // Check suggestions dropdown
    const suggestionsDropdown = page.locator('[data-testid="search-suggestions"]');
    if (await suggestionsDropdown.isVisible()) {
      const suggestions = page.locator('[data-testid="suggestion-item"]');
      const suggestionCount = await suggestions.count();
      expect(suggestionCount).toBeGreaterThan(0);
      
      // Click on first suggestion
      await suggestions.first().click();
      
      // Should trigger search
      await page.waitForLoadState('networkidle');
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    }
  });

  test('filters search results by type', async ({ page }) => {
    // Perform initial search
    await page.fill('[data-testid="search-input"]', 'biology');
    await page.click('[data-testid="search-button"]');
    await page.waitForLoadState('networkidle');

    // Check initial results count
    const allResults = page.locator('[data-testid="search-result-item"]');
    const initialCount = await allResults.count();
    expect(initialCount).toBeGreaterThan(1);

    // Filter by taxonomy type
    await page.click('[data-testid="filter-taxonomy"]');
    await page.waitForLoadState('networkidle');

    // Check filtered results
    const filteredResults = page.locator('[data-testid="search-result-item"]');
    const filteredCount = await filteredResults.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // All visible results should be taxonomies
    for (let i = 0; i < filteredCount; i++) {
      const resultType = filteredResults.nth(i).locator('[data-testid="result-type"]');
      await expect(resultType).toContainText('taxonomy');
    }
  });

  test('clears search filters', async ({ page }) => {
    // Perform search with filter
    await page.fill('[data-testid="search-input"]', 'biology');
    await page.click('[data-testid="filter-category"]');
    await page.click('[data-testid="search-button"]');
    await page.waitForLoadState('networkidle');

    const filteredCount = await page.locator('[data-testid="search-result-item"]').count();

    // Clear filters
    const clearFiltersButton = page.locator('[data-testid="clear-filters"]');
    if (await clearFiltersButton.isVisible()) {
      await clearFiltersButton.click();
      await page.waitForLoadState('networkidle');

      // Should show more results
      const unfilteredCount = await page.locator('[data-testid="search-result-item"]').count();
      expect(unfilteredCount).toBeGreaterThanOrEqual(filteredCount);
    }
  });

  test('handles empty search results', async ({ page }) => {
    // Search for something that won't match
    await page.fill('[data-testid="search-input"]', 'xyz123notfound');
    await page.click('[data-testid="search-button"]');
    await page.waitForLoadState('networkidle');

    // Check empty state
    const emptyState = page.locator('[data-testid="empty-search-results"]');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText(/no results found/i);

    // Check suggestions for better search
    const searchSuggestions = page.locator('[data-testid="search-suggestions-help"]');
    if (await searchSuggestions.isVisible()) {
      await expect(searchSuggestions).toContainText(/try different keywords/i);
    }
  });

  test('navigates to search result details', async ({ page }) => {
    // Perform search
    await page.fill('[data-testid="search-input"]', 'biology');
    await page.click('[data-testid="search-button"]');
    await page.waitForLoadState('networkidle');

    // Click on first result
    const firstResult = page.locator('[data-testid="search-result-item"]').first();
    await firstResult.click();

    // Should navigate to detail page or open modal
    const currentUrl = page.url();
    const isNavigated = currentUrl.includes('/taxonomies/') || 
                       currentUrl.includes('/categories/') || 
                       currentUrl.includes('/namespaces/');
    
    const isModalOpen = await page.locator('[data-testid="detail-modal"]').isVisible();

    expect(isNavigated || isModalOpen).toBeTruthy();
  });

  test('displays search result metadata', async ({ page }) => {
    // Perform search
    await page.fill('[data-testid="search-input"]', 'animals');
    await page.click('[data-testid="search-button"]');
    await page.waitForLoadState('networkidle');

    const resultItem = page.locator('[data-testid="search-result-item"]').first();
    
    // Check result has all required elements
    await expect(resultItem.locator('[data-testid="result-name"]')).toBeVisible();
    await expect(resultItem.locator('[data-testid="result-description"]')).toBeVisible();
    await expect(resultItem.locator('[data-testid="result-type"]')).toBeVisible();

    // Check score if displayed
    const scoreElement = resultItem.locator('[data-testid="result-score"]');
    if (await scoreElement.isVisible()) {
      await expect(scoreElement).toContainText(/\d+%|\d+\.\d+/);
    }
  });

  test('handles search with special characters', async ({ page }) => {
    // Search with special characters
    const specialQuery = 'bio-taxonomy & classification (v1.0)';
    await page.fill('[data-testid="search-input"]', specialQuery);
    await page.click('[data-testid="search-button"]');
    await page.waitForLoadState('networkidle');

    // Should not crash and should handle gracefully
    const searchResults = page.locator('[data-testid="search-results"]');
    await expect(searchResults).toBeVisible();

    // Check that query is preserved in input
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toHaveValue(specialQuery);
  });

  test('preserves search state in URL', async ({ page }) => {
    // Perform search
    await page.fill('[data-testid="search-input"]', 'biology');
    await page.click('[data-testid="filter-taxonomy"]');
    await page.click('[data-testid="search-button"]');
    await page.waitForLoadState('networkidle');

    // Check URL contains search parameters
    const currentUrl = page.url();
    expect(currentUrl).toContain('q=biology');
    expect(currentUrl).toContain('type=taxonomy');

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Search state should be restored
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toHaveValue('biology');

    const taxonomyFilter = page.locator('[data-testid="filter-taxonomy"]');
    await expect(taxonomyFilter).toHaveClass(/active|selected/);
  });

  test('handles pagination in search results', async ({ page }) => {
    // Mock large result set
    await page.route('**/v1/taxonomy/search*', async (route) => {
      const url = route.request().url();
      const urlObj = new URL(url);
      const page_param = parseInt(urlObj.searchParams.get('page') || '1');
      
      const allResults = Array.from({ length: 50 }, (_, i) => ({
        id: `${i + 1}`,
        type: 'category',
        name: `Result ${i + 1}`,
        description: `Description for result ${i + 1}`,
        score: 0.9 - (i * 0.01),
        metadata: {}
      }));

      const pageSize = 20;
      const startIndex = (page_param - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const pageResults = allResults.slice(startIndex, endIndex);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            results: pageResults,
            totalCount: allResults.length,
            query: 'test',
            type: 'all',
            pagination: {
              page: page_param,
              limit: pageSize,
              total: allResults.length,
              totalPages: Math.ceil(allResults.length / pageSize)
            }
          }
        })
      });
    });

    // Perform search
    await page.fill('[data-testid="search-input"]', 'test');
    await page.click('[data-testid="search-button"]');
    await page.waitForLoadState('networkidle');

    // Check pagination controls
    const pagination = page.locator('[data-testid="search-pagination"]');
    if (await pagination.isVisible()) {
      // Go to next page
      const nextButton = pagination.locator('[data-testid="next-page"]');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForLoadState('networkidle');

        // Check page updated
        const pageIndicator = page.locator('[data-testid="current-page"]');
        if (await pageIndicator.isVisible()) {
          await expect(pageIndicator).toContainText('2');
        }
      }
    }
  });

  test('handles search loading states', async ({ page }) => {
    // Navigate to search page
    await page.goto('/search');

    // Start search
    await page.fill('[data-testid="search-input"]', 'biology');
    await page.click('[data-testid="search-button"]');

    // Check for loading indicator
    const loadingSpinner = page.locator('[data-testid="search-loading"]');
    const loadingText = page.locator('[data-testid="search-loading-text"]');
    
    const hasSpinner = await loadingSpinner.isVisible({ timeout: 1000 });
    const hasLoadingText = await loadingText.isVisible({ timeout: 1000 });
    
    if (hasSpinner || hasLoadingText) {
      // Wait for loading to complete
      await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });
      await expect(loadingText).not.toBeVisible({ timeout: 5000 });
    }

    // Results should be visible
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('handles search errors', async ({ page }) => {
    // Mock API error
    await page.route('**/v1/taxonomy/search*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Search service unavailable'
        })
      });
    });

    // Perform search
    await page.fill('[data-testid="search-input"]', 'biology');
    await page.click('[data-testid="search-button"]');
    await page.waitForLoadState('networkidle');

    // Check error message
    const errorMessage = page.locator('[data-testid="search-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/error|failed|unavailable/i);

    // Check retry button
    const retryButton = page.locator('[data-testid="retry-search"]');
    if (await retryButton.isVisible()) {
      await expect(retryButton).toBeVisible();
    }
  });

  test('is responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/search');

    // Check mobile layout
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();

    // Filters might be in a collapsible menu on mobile
    const mobileFilterToggle = page.locator('[data-testid="mobile-filter-toggle"]');
    if (await mobileFilterToggle.isVisible()) {
      await mobileFilterToggle.click();
      await expect(page.locator('[data-testid="mobile-filters"]')).toBeVisible();
    }

    // Perform search
    await page.fill('[data-testid="search-input"]', 'biology');
    await page.click('[data-testid="search-button"]');
    await page.waitForLoadState('networkidle');

    // Results should display in single column
    const resultItems = page.locator('[data-testid="search-result-item"]');
    if (await resultItems.count() > 1) {
      const firstResult = resultItems.first();
      const secondResult = resultItems.nth(1);
      
      const firstBox = await firstResult.boundingBox();
      const secondBox = await secondResult.boundingBox();
      
      // Results should be stacked vertically
      expect(secondBox!.y).toBeGreaterThan(firstBox!.y + firstBox!.height - 10);
    }
  });
});
