import { test, expect } from '@playwright/test';

test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the board with columns and cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Kanban Board' })).toBeVisible();
    
    const columns = ['To Do', 'In Progress', 'Review', 'Testing', 'Done'];
    for (const columnName of columns) {
      await expect(page.getByText(columnName)).toBeVisible();
    }

    await expect(page.getByText('Design user interface')).toBeVisible();
  });

  test('should add a new card to a column', async ({ page }) => {
    const addCardButton = page.getByRole('button', { name: '+ Add Card' }).first();
    await addCardButton.click();

    await page.getByPlaceholderText('Card title').fill('New Test Card');
    await page.getByPlaceholderText('Card details').fill('This is a test card');
    await page.getByRole('button', { name: 'Add Card' }).click();

    await expect(page.getByText('New Test Card')).toBeVisible();
    await expect(page.getByText('This is a test card')).toBeVisible();
  });

  test('should delete a card', async ({ page }) => {
    const cardTitle = 'Design user interface';
    await expect(page.getByText(cardTitle)).toBeVisible();

    const card = page.locator('div').filter({ hasText: cardTitle }).first();
    const deleteButton = card.getByRole('button', { name: 'Delete' });
    await deleteButton.click();

    await expect(page.getByText(cardTitle)).not.toBeVisible();
  });

  test('should rename a column', async ({ page }) => {
    const columnTitle = page.getByText('To Do').first();
    await columnTitle.click();

    const input = page.getByDisplayValue('To Do');
    await input.fill('New Column Name');
    await input.press('Enter');

    await expect(page.getByText('New Column Name')).toBeVisible();
    await expect(page.getByText('To Do')).not.toBeVisible();
  });

  test('should move a card between columns using drag and drop', async ({ page }) => {
    const cardTitle = 'Design user interface';
    const sourceColumn = page.getByText('To Do').first();
    const targetColumn = page.getByText('In Progress').first();

    await expect(sourceColumn).toBeVisible();
    await expect(targetColumn).toBeVisible();

    const card = page.locator('div').filter({ hasText: cardTitle }).first();
    
    const sourceColumnElement = sourceColumn.locator('..').locator('..');
    const targetColumnElement = targetColumn.locator('..').locator('..');

    await card.dragTo(targetColumnElement);

    await expect(targetColumnElement.getByText(cardTitle)).toBeVisible();
  });

  test('should cancel adding a card', async ({ page }) => {
    const addCardButton = page.getByRole('button', { name: '+ Add Card' }).first();
    await addCardButton.click();

    await page.getByPlaceholderText('Card title').fill('Test Card');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByText('Test Card')).not.toBeVisible();
    await expect(addCardButton).toBeVisible();
  });

  test('should not add card with empty title', async ({ page }) => {
    const addCardButton = page.getByRole('button', { name: '+ Add Card' }).first();
    await addCardButton.click();

    await page.getByPlaceholderText('Card details').fill('Details only');
    await page.getByRole('button', { name: 'Add Card' }).click();

    const form = page.getByPlaceholderText('Card title');
    await expect(form).toBeVisible();
  });
});
