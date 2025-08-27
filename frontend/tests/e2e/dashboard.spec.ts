/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * E2E tests for the dashboard page
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for consistent testing
    await page.route('**/v1/taxonomy/health', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            database: 'healthy',
            cache: 'healthy'
          }
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
              namespaceId: 'bio',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z'
            },
            {
              id: '2',
              name: 'Chemistry',
              description: 'Chemical classification system',
              version: '1.0.0',
              namespaceId: 'chem',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1
          }
        })
      });
    });

    await page.route('**/v1/taxonomy/namespaces*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'bio',
              name: 'Biology Namespace',
              description: 'Biological sciences namespace',
              createdAt: '2024-01-01T00:00:00Z'
            },
            {
              id: 'chem',
              name: 'Chemistry Namespace',
              description: 'Chemical sciences namespace',
              createdAt: '2024-01-01T00:00:00Z'
            }
          ]
        })
      });
    });

    await page.route('**/v1/taxonomy/categories*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: '1',
              name: 'Animals',
              description: 'Animal kingdom classification',
              taxonomyId: '1',
              parentId: null,
              level: 0,
              createdAt: '2024-01-01T00:00:00Z'
            },
            {
              id: '2',
              name: 'Plants',
              description: 'Plant kingdom classification',
              taxonomyId: '1',
              parentId: null,
              level: 0,
              createdAt: '2024-01-01T00:00:00Z'
            }
          ]
        })
      });
    });

    // Navigate to dashboard
    await page.goto('/');
  });

  test('displays dashboard layout correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Taxonomy Dashboard/);

    // Check main navigation is present
    await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible();

    // Check dashboard header
    await expect(page.locator('h1')).toContainText('Taxonomy Dashboard');

    // Check overview cards are present
    await expect(page.locator('[data-testid="stats-overview"]')).toBeVisible();
  });

  test('shows taxonomy statistics', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');

    // Check for statistics cards
    const statsCards = page.locator('[data-testid="stat-card"]');
    await expect(statsCards).toHaveCount(4);

    // Check individual stat cards
    await expect(page.locator('[data-testid="taxonomies-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="namespaces-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="categories-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="tags-count"]')).toBeVisible();
  });

  test('displays recent taxonomies section', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');

    // Check recent taxonomies section
    await expect(page.locator('[data-testid="recent-taxonomies"]')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Recent Taxonomies');

    // Check taxonomy cards are displayed
    const taxonomyCards = page.locator('[data-testid="taxonomy-card"]');
    await expect(taxonomyCards).toHaveCount(2);

    // Check first taxonomy card content
    const firstCard = taxonomyCards.first();
    await expect(firstCard.locator('h3')).toContainText('Biology');
    await expect(firstCard.locator('p')).toContainText('Biological classification system');
  });

  test('navigates to taxonomies page from overview', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');

    // Click on "View All" taxonomies link
    await page.click('[data-testid="view-all-taxonomies"]');

    // Check navigation to taxonomies page
    await expect(page).toHaveURL('/taxonomies');
  });

  test('navigates to namespaces page', async ({ page }) => {
    // Click on namespaces in navigation
    await page.click('[data-testid="nav-namespaces"]');

    // Check navigation
    await expect(page).toHaveURL('/namespaces');
  });

  test('navigates to categories page', async ({ page }) => {
    // Click on categories in navigation
    await page.click('[data-testid="nav-categories"]');

    // Check navigation
    await expect(page).toHaveURL('/categories');
  });

  test('handles search functionality', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');

    // Check if search is available in header
    const searchInput = page.locator('[data-testid="global-search"]');
    if (await searchInput.isVisible()) {
      // Enter search term
      await searchInput.fill('biology');
      await searchInput.press('Enter');

      // Should navigate to search page
      await expect(page).toHaveURL(/\/search/);
    }
  });

  test('displays health status', async ({ page }) => {
    // Wait for health check
    await page.waitForLoadState('networkidle');

    // Check for health indicator
    const healthIndicator = page.locator('[data-testid="health-status"]');
    if (await healthIndicator.isVisible()) {
      await expect(healthIndicator).toContainText('healthy');
    }
  });

  test('handles loading states', async ({ page }) => {
    // Navigate to page
    await page.goto('/');

    // Check for loading indicators
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    
    // Loading should appear briefly
    if (await loadingSpinner.isVisible({ timeout: 1000 })) {
      // Wait for loading to complete
      await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });
    }

    // Content should be visible after loading
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
  });

  test('handles error states gracefully', async ({ page }) => {
    // Mock API error for testing
    await page.route('**/v1/taxonomy/taxonomies*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal server error'
        })
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for error message or fallback content
    const errorMessage = page.locator('[data-testid="error-message"]');
    const fallbackContent = page.locator('[data-testid="fallback-content"]');
    
    const hasError = await errorMessage.isVisible();
    const hasFallback = await fallbackContent.isVisible();
    
    expect(hasError || hasFallback).toBeTruthy();
  });

  test('is responsive on mobile devices', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check mobile navigation
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    }

    // Check that content is still accessible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="stats-overview"]')).toBeVisible();
  });

  test('accessibility compliance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for basic accessibility attributes
    await expect(page.locator('main')).toHaveAttribute('role');
    
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Check for skip link
    const skipLink = page.locator('[data-testid="skip-to-content"]');
    if (await skipLink.isVisible()) {
      await expect(skipLink).toHaveAttribute('href', '#main-content');
    }

    // Check for proper button labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const hasAriaLabel = await button.getAttribute('aria-label');
      const hasText = await button.textContent();
      
      expect(hasAriaLabel || hasText).toBeTruthy();
    }
  });
});
