import { expect, test } from '@playwright/test';

test('browse groups link through to author and poem pages', async ({ page }) => {
  await page.goto('browse/?author_slug=walt-whitman');

  const group = page.locator('details[data-author-slug="walt-whitman"]');
  await expect(group).toHaveAttribute('open', '');

  await group.getByRole('link', { name: 'View author page' }).click();
  await expect(page).toHaveURL(/author\/walt-whitman\/$/);
  await expect(page.getByRole('heading', { name: 'Walt Whitman' })).toBeVisible();

  await page.getByRole('link', { name: 'O Captain! My Captain!' }).click();
  await expect(page).toHaveURL(/poem\/walt-whitman\/o-captain-my-captain\/$/);

  await page.locator('.reader-byline a', { hasText: 'Walt Whitman' }).click();
  await expect(page).toHaveURL(/author\/walt-whitman\/$/);
});
