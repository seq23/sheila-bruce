import { test, expect } from '@playwright/test';
const routes=['/','/about','/sheila','/events','/gallery','/inspiration','/contact','/admin'];
test('surface gauntlet: public and admin pages load', async ({ page }) => {
  for (const r of routes) { await page.goto(r); await expect(page.locator('body')).toBeVisible(); await expect(page.locator('header.site-header')).toBeVisible(); await expect(page.locator('header.site-header img[alt="A Sheila Bruce Affair logo"]')).toBeVisible(); }
});
test('outcome gauntlet: no seeded archive event invites registration', async ({ page }) => {
  await page.goto('/events');
  await expect(page.getByText('New fabulous affairs are being planned')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Archive of fabulous gatherings' })).toBeVisible();
  await expect(page.getByText('Register Now')).toHaveCount(0);
});
test('visual hierarchy gauntlet: event archive cards are readable and substantial', async ({ page }) => {
  await page.goto('/events');
  const firstCard=page.locator('.event-card--archive').first();
  await expect(firstCard.locator('.event-card__media')).toBeVisible();
  await expect(firstCard.locator('.event-card__title')).toBeVisible();
  await expect(firstCard.locator('.event-card__description')).toBeVisible();
  await expect(firstCard.locator('.event-category-pill')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tuxedo Ball' })).toBeVisible();
});
test('visual hierarchy gauntlet: locked image roles render on core pages', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('img[src="/assets/brand/sheila/sheila-black-dress-hero.jpg"]')).toBeVisible();
  await expect(page.locator('img[src="/assets/brand/sheila/sheila-blue-hat-about.png"]')).toBeVisible();
  await expect(page.locator('.portrait-contain--blue-hat img')).toBeVisible();
  await page.goto('/about');
  await expect(page.locator('img[src="/assets/sarasota/sarasota-gulf-coast-yacht.jpg"]')).toBeVisible();
  await page.goto('/sheila');
  await expect(page.locator('.hero-card.full-dress-photo img[src="/assets/brand/sheila/sheila-twirling-black-dress.jpg"]')).toBeVisible();
});
test('gallery gauntlet: gallery has clear hybrid V1 sections', async ({ page }) => {
  await page.goto('/gallery');
  await expect(page.getByRole('heading', { name: 'Favorite snapshots' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Browse by affair' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Past affair flyers' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Watch Sheila & the Affair' })).toBeVisible();
  await expect(page.locator('video').first()).toBeVisible();
});
test('contact gauntlet: contact uses mailto plus guest-list capture', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.getByRole('link', { name: 'Send a Message' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Keep in Touch' })).toBeVisible();
  await expect(page.locator('[data-email-list-form] input[name=name]')).toBeVisible();
  await expect(page.locator('[data-email-list-form] input[name=email]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Join the List' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Inquire About an Event' })).toHaveCount(0);
  await expect(page.locator('[data-contact-form]')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Inquiry form' })).toHaveCount(0);
});
test('transaction gauntlet: local admin create/unpublish/republish/delete journey', async ({ page }) => {
  await page.goto('/admin');
  await page.locator('input[name=password]').fill('blackgirlmagic');
  await page.getByRole('button',{name:'Enter Admin'}).click();
  await expect(page.getByText(/Admin unlocked/)).toBeVisible();
  await page.locator('[data-create-event] input[name=title]').fill('E2E Fabulous Test Affair');
  await page.locator('[data-create-event] textarea[name=summary]').fill('A local test event for the Master Gauntlet.');
  await expect(page.locator('[data-create-event] input[name=registrationQr]')).toBeVisible();
  await expect(page.getByText('Registration QR Code')).toBeVisible();
  await page.locator('[data-create-event] button[type=submit]').click();
  await expect(page.getByText(/Local preview saved event|Published event through GitHub/)).toBeVisible();
  await page.getByRole('button',{name:'Homepage Feature'}).click();
  await expect(page.locator('[data-feature-choice]')).toBeVisible();
  await expect(page.locator('[data-feature-choice]')).toContainText('Event — Tuxedo Ball');
  await expect(page.getByText('slug/id')).toHaveCount(0);
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
