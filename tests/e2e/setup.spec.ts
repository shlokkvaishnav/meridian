import { test, expect } from '@playwright/test';

test.describe('Setup Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/setup');
  });

  test('should display setup page with PAT input', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /connect your github/i })).toBeVisible();
    await expect(page.getByPlaceholder(/github personal access token/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /connect/i })).toBeVisible();
  });

  test('should show validation error for invalid token', async ({ page }) => {
    const tokenInput = page.getByPlaceholder(/github personal access token/i);
    const connectButton = page.getByRole('button', { name: /connect/i });

    // Enter invalid token (too short)
    await tokenInput.fill('invalid');
    await connectButton.click();

    // Should show validation error
    await expect(page.getByText(/token must be at least/i)).toBeVisible();
  });

  test('should show error for invalid GitHub token', async ({ page }) => {
    const tokenInput = page.getByPlaceholder(/github personal access token/i);
    const connectButton = page.getByRole('button', { name: /connect/i });

    // Enter fake token (valid format but not a real token)
    await tokenInput.fill('ghp_fake1234567890abcdefghijklmnopqrstuvw');
    await connectButton.click();

    // Should show error from API
    await expect(page.getByText(/bad credentials|invalid token/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test('should redirect to dashboard on successful setup', async ({ page }) => {
    // This test requires a real GitHub PAT
    // Skip in CI/automated testing
    test.skip(
      !process.env.GITHUB_TEST_TOKEN,
      'Skipping test: GITHUB_TEST_TOKEN not set'
    );

    const tokenInput = page.getByPlaceholder(/github personal access token/i);
    const connectButton = page.getByRole('button', { name: /connect/i });

    await tokenInput.fill(process.env.GITHUB_TEST_TOKEN!);
    await connectButton.click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });
});
