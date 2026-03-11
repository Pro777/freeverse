import { expect, test } from '@playwright/test';

test('browse filter narrows groups and expands matches', async ({ page }) => {
  await page.goto('browse/');

  const filter = page.getByLabel('Quick filter');
  const waltGroup = page.locator('details[data-author-slug="walt-whitman"]');
  const emilyGroup = page.locator('details[data-author-slug="emily-dickinson"]');
  const status = page.locator('[data-browse-filter-status]');

  await expect(waltGroup).not.toHaveAttribute('open', '');
  await expect(emilyGroup).not.toHaveAttribute('open', '');

  await filter.fill('captain');

  await expect(waltGroup).toHaveAttribute('open', '');
  await expect(waltGroup.getByRole('link', { name: 'O Captain! My Captain!' })).toBeVisible();
  await expect(emilyGroup).toHaveAttribute('hidden', '');
  await expect(status).toContainText('for "captain".');

  await filter.fill('');

  await expect(waltGroup).not.toHaveAttribute('open', '');
  await expect(emilyGroup).not.toHaveAttribute('hidden', '');
  await expect(status).toContainText('All author groups are collapsed by default.');
});

test('browse honors the author_slug query parameter', async ({ page }) => {
  await page.goto('browse/?author_slug=emily-dickinson');

  const group = page.locator('details[data-author-slug="emily-dickinson"]');
  const status = page.locator('[data-browse-filter-status]');

  await expect(group).toHaveAttribute('open', '');
  await expect(group.getByRole('link', { name: 'View author page' })).toBeVisible();
  await expect(status).toContainText('requested author stays expanded');
});
