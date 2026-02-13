import { expect, test } from '@playwright/test';

test('author links navigate to author pages', async ({ page }) => {
  await page.goto('browse/');

  await page.locator('a', { hasText: 'Walt Whitman' }).first().click();
  await expect(page).toHaveURL(/author\/walt-whitman\/$/);
  await expect(page.getByRole('heading', { name: 'Walt Whitman' })).toBeVisible();

  await page.getByRole('link', { name: 'O Captain! My Captain!' }).click();
  await expect(page).toHaveURL(/poem\/walt-whitman\/o-captain-my-captain\/$/);

  await page.locator('.reader-byline a', { hasText: 'Walt Whitman' }).click();
  await expect(page).toHaveURL(/author\/walt-whitman\/$/);
});
