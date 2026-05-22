import { test, expect } from '@playwright/test';
const routes=['/','/about','/sheila','/events','/gallery','/inspiration','/contact','/admin'];
test('surface gauntlet: public and admin pages load', async ({ page }) => {
  for (const r of routes) { await page.goto(r); await expect(page.locator('body')).toBeVisible(); await expect(page.locator('header.site-header')).toBeVisible(); await expect(page.locator('header.site-header img[alt="A Sheila Bruce Affair logo"]')).toBeVisible(); }
});
test('outcome gauntlet: no seeded archive event invites registration', async ({ page }) => {
  await page.goto('/events');
  await expect(page.getByText('New fabulous affairs are being planned')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Past Affairs' })).toBeVisible();
  await expect(page.getByText('Register Now')).toHaveCount(0);
});
test('transaction gauntlet: local admin create/unpublish/republish/delete journey', async ({ page }) => {
  await page.goto('/admin');
  await page.locator('input[name=password]').fill('blackgirlmagic');
  await page.getByRole('button',{name:'Enter Admin'}).click();
  await expect(page.getByText('Admin unlocked')).toBeVisible();
  await page.locator('[data-create-event] input[name=title]').fill('E2E Fabulous Test Affair');
  await page.locator('[data-create-event] textarea[name=summary]').fill('A local test event for the Master Gauntlet.');
  await page.locator('[data-create-event] button[type=submit]').click();
  await expect(page.getByText(/Local preview saved event|Published event through GitHub/)).toBeVisible();
  await page.getByRole('button',{name:'Manage Content'}).click();
  await page.getByRole('button',{name:'Refresh Local Test Content'}).click();
  await expect(page.getByRole('heading', { name: 'E2E Fabulous Test Affair' })).toBeVisible();
  await page.getByRole('button',{name:'Unpublish'}).first().click();
  await expect(page.getByText('unpublish saved')).toBeVisible();
  await page.getByRole('button',{name:'Republish'}).first().click();
  await expect(page.getByText('republish saved')).toBeVisible();
  await page.getByRole('button',{name:'Delete'}).first().click();
  await expect(page.getByText('delete saved')).toBeVisible();
});
test('schema/media gauntlet: JSON-LD and video controls exist', async ({ page }) => {
  await page.goto('/gallery');
  await expect(page.locator('footer.footer')).toBeVisible(); await expect(page.getByRole('link', { name: 'Facebook' })).toBeVisible(); await expect(page.locator('video').first()).toBeVisible();
  await page.goto('/events/tuxedo-ball');
  await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();
});

test('visual hierarchy gauntlet: locked image roles render on core pages', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('img[src="/assets/brand/sheila/sheila-black-dress-hero.jpg"]')).toBeVisible();
  await expect(page.locator('img[src="/assets/brand/sheila/sheila-blue-hat-about.png"]')).toBeVisible();
  await page.goto('/about');
  await expect(page.locator('img[src="/assets/sarasota/sarasota-gulf-coast-yacht.jpg"]')).toBeVisible();
  await page.goto('/sheila');
  await expect(page.locator('img[src="/assets/brand/sheila/sheila-twirling-black-dress.jpg"]')).toBeVisible();
});
