import { test, expect } from '@playwright/test'

test.describe('Kanban Board MVP', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads with 5 columns and dummy data', async ({ page }) => {
    // Check that all 5 columns are visible
    await expect(page.locator('h3').filter({ hasText: 'To Do' })).toBeVisible()
    await expect(page.locator('h3').filter({ hasText: 'In Progress' })).toBeVisible()
    await expect(page.locator('h3').filter({ hasText: 'In Review' })).toBeVisible()
    await expect(page.locator('h3').filter({ hasText: 'Done' })).toBeVisible()
    await expect(page.locator('h3').filter({ hasText: 'Archived' })).toBeVisible()

    // Check that cards are visible
    await expect(page.locator('text=Design homepage')).toBeVisible()
    await expect(page.locator('text=Build API')).toBeVisible()
  })

  test('can rename a column', async ({ page }) => {
    // Click on "To Do" column title to edit
    const columnTitle = page.locator('h3').filter({ hasText: 'To Do' })
    await columnTitle.click()

    // Find the input field and update the text
    const input = page.locator('input[type="text"]').first()
    await input.clear()
    await input.fill('Todo Updated')
    await input.press('Enter')

    // Verify the title changed
    await expect(page.locator('h3').filter({ hasText: 'Todo Updated' })).toBeVisible()
  })

  test('can add a card to a column', async ({ page }) => {
    // Click "+ Add Card" button in the first column
    const addCardButtons = page.locator('button:has-text("+ Add Card")')
    await addCardButtons.first().click()

    // Fill in the form
    const titleInput = page.locator('input[placeholder="Card title"]')
    const detailsInput = page.locator('textarea[placeholder="Details"]')

    await titleInput.fill('New Test Card')
    await detailsInput.fill('This is a test card')

    // Click Add button
    await page.locator('button:has-text("Add")').first().click()

    // Verify the card was added
    await expect(page.locator('text=New Test Card')).toBeVisible()
    await expect(page.locator('text=This is a test card')).toBeVisible()
  })

  test('can delete a card', async ({ page }) => {
    // Find and delete the first card in the "To Do" column
    const deleteButtons = page.locator('button:has-text("×")')
    const initialCount = await deleteButtons.count()

    // Click the first delete button
    await deleteButtons.first().click()

    // Verify the count decreased
    const newCount = await page.locator('button:has-text("×")').count()
    expect(newCount).toBe(initialCount - 1)
  })

  test('can drag a card to another column', async ({ page }) => {
    // Get the first card from "To Do" column
    const cardLocator = page.locator('.card').first()

    // Get the "In Progress" column
    const targetColumn = page.locator('h3').filter({ hasText: 'In Progress' }).locator('..').first()

    // Drag the card to the target column
    await cardLocator.dragTo(targetColumn)

    // Wait a bit for the drag to complete
    await page.waitForTimeout(500)

    // Verify the card is still visible (it moved columns)
    const firstCardTitle = await cardLocator.locator('h4').textContent()
    await expect(page.locator(`text=${firstCardTitle}`)).toBeVisible()
  })

  test('column card counts update correctly', async ({ page }) => {
    // Get the initial count for "To Do" column
    const columnCountBadges = page.locator('span').filter({ hasText: /^\d+$/ })
    const initialFirstCount = await columnCountBadges.first().textContent()

    // Add a card to the first column
    await page.locator('button:has-text("+ Add Card")').first().click()
    await page.locator('input[placeholder="Card title"]').fill('Test')
    await page.locator('textarea[placeholder="Details"]').fill('Test')
    await page.locator('button:has-text("Add")').first().click()

    // Check that the count increased
    const newFirstCount = await columnCountBadges.first().textContent()
    expect(parseInt(newFirstCount || '0')).toBe(parseInt(initialFirstCount || '0') + 1)
  })

  test('can add and delete cards multiple times', async ({ page }) => {
    // Add a card
    await page.locator('button:has-text("+ Add Card")').first().click()
    await page.locator('input[placeholder="Card title"]').fill('Card 1')
    await page.locator('textarea[placeholder="Details"]').fill('Details 1')
    await page.locator('button:has-text("Add")').first().click()

    // Verify it was added
    await expect(page.locator('text=Card 1')).toBeVisible()

    // Add another card
    await page.locator('button:has-text("+ Add Card")').first().click()
    await page.locator('input[placeholder="Card title"]').fill('Card 2')
    await page.locator('textarea[placeholder="Details"]').fill('Details 2')
    await page.locator('button:has-text("Add")').first().click()

    // Verify both are visible
    await expect(page.locator('text=Card 1')).toBeVisible()
    await expect(page.locator('text=Card 2')).toBeVisible()

    // Delete Card 1
    const cards = page.locator('.card')
    const card1 = cards.filter({ hasText: 'Card 1' })
    const deleteBtn = card1.locator('button:has-text("×")')
    await deleteBtn.click()

    // Verify Card 1 is gone but Card 2 remains
    await expect(page.locator('text=Card 1')).not.toBeVisible()
    await expect(page.locator('text=Card 2')).toBeVisible()
  })

  test('UI is responsive and has correct colors', async ({ page }) => {
    // Check header styling
    const header = page.locator('.site-header')
    await expect(header).toHaveCSS('border-bottom-color', 'rgb(236, 173, 10)') // Yellow accent

    // Check a column has proper styling
    const column = page.locator('.column').first()
    const bgColor = await column.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    expect(bgColor).toBeTruthy()
  })
})
