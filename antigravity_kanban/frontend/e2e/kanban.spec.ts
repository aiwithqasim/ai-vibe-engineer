import { test, expect } from '@playwright/test';

test.describe('Kanban Board Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for Next.js to fully hydrate and mount components
    await page.waitForSelector('text=Kanban Pro');
  });

  test('should load the full board and all initial columns', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Kanban Pro' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Backlog' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'To Do' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'In Progress' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Review' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Done' })).toBeVisible();
  });

  test('should display initial dummy cards', async ({ page }) => {
    await expect(page.locator('h4', { hasText: 'Setup Repository' })).toBeVisible();
    await expect(page.locator('h4', { hasText: 'Design System' })).toBeVisible();
    await expect(page.locator('h4', { hasText: 'Build Components' })).toBeVisible();
    await expect(page.locator('h4', { hasText: 'Research DnD' })).toBeVisible();
    await expect(page.locator('h4', { hasText: 'Code Review' })).toBeVisible();
  });
});
