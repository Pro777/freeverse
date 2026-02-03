import { expect, test } from '@playwright/test';

test('clicking and shift-clicking lines updates hash', async ({ page }) => {
  // NOTE: no leading slash, so this resolves under baseURL (/freeverse)
  await page.goto('poem/walt-whitman/o-captain-my-captain/');

  // Click a non-blank line
  await page.locator('.poem-lines li#l1').click();
  await expect(page).toHaveURL(/#l1$/);

  // Shift-click another line to create a range
  await page.locator('.poem-lines li#l4').click({ modifiers: ['Shift'] });
  await expect(page).toHaveURL(/#l1-l4$/);

  // Clicking a new line resets to single
  await page.locator('.poem-lines li#l10').click();
  await expect(page).toHaveURL(/#l10$/);
});
