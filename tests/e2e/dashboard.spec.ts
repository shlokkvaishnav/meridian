import { test, expect } from '@playwright/test';

test.describe('Dashboard and Sync', () => {
  test.beforeEach(async ({ page, context }) => {
    // This test requires authentication
    // Skip if no test token is available
    test.skip(
      !process.env.GITHUB_TEST_TOKEN,
      'Skipping test: GITHUB_TEST_TOKEN not set'
    );

    // Set up session cookie manually for testing
    // In a real scenario, you'd go through the setup flow first
    await context.addCookies([
      {
        name: 'session_id',
        value: process.env.TEST_SESSION_ID || 'test-session',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/dashboard');
  });

  test('should display dashboard with metrics', async ({ page }) => {
    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // Check for metric cards
    await expect(page.getByText(/total prs/i)).toBeVisible();
    await expect(page.getByText(/merged/i)).toBeVisible();
    await expect(page.getByText(/open/i)).toBeVisible();
  });

  test('should show sync button and trigger sync', async ({ page }) => {
    const syncButton = page.getByRole('button', { name: /sync/i }).first();
    await expect(syncButton).toBeVisible();

    // Click sync button
    await syncButton.click();

    // Should show loading state
    await expect(page.getByText(/syncing/i)).toBeVisible({ timeout: 2000 });

    // Wait for sync to complete (this could take a while with real API)
    await expect(page.getByText(/syncing/i)).not.toBeVisible({
      timeout: 30000,
    });
  });

  test('should display repositories after data is loaded', async ({ page }) => {
    // Wait for repositories section
    const reposSection = page.getByRole('heading', { name: /repositories/i });
    await expect(reposSection).toBeVisible();

    // Check if at least one repository card is displayed
    // This assumes the test account has at least one repository
    const repoCards = page.locator('.glass-card');
    await expect(repoCards.first()).toBeVisible({ timeout: 5000 });
  });

  test('should display recent pull requests', async ({ page }) => {
    // Check for recent PRs section
    const prSection = page.getByRole('heading', { name: /recent pull requests/i });
    
    // This might not be visible if there are no PRs
    const hasPRs = await prSection.isVisible().catch(() => false);
    
    if (hasPRs) {
      await expect(prSection).toBeVisible();
    } else {
      // Should show empty state or "No data yet" message
      await expect(
        page.getByText(/no data yet|sync your github/i)
      ).toBeVisible();
    }
  });
});
