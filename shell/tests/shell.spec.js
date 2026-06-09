const { test, expect } = require('@playwright/test');

test.describe('Combine UI Integration Shell E2E Tests', () => {
  
  test('unauthenticated users are redirected to login', async ({ page }) => {
    // Navigate to root
    await page.goto('http://localhost:3000/');
    
    // Check that we are redirected to /login
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('h2')).toContainText('Combine UI');
    await expect(page.locator('p')).toContainText('Please log in');
  });

  test('credentials login succeeds and redirects to home', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Fill credentials
    await page.fill('input[placeholder="e.g. admin"]', 'admin');
    await page.fill('input[placeholder="••••••••"]', 'admin123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check redirection to homepage
    await expect(page).toHaveURL('http://localhost:3000/');
    
    // Check shell layout elements
    await expect(page.locator('.logo-section')).toContainText('Combine UI');
    await expect(page.locator('.app-tabs button')).toHaveCount(3);
  });

  test('The Closer tab switches and renders native composer', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('input[placeholder="e.g. admin"]', 'admin');
    await page.fill('input[placeholder="••••••••"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3000/');

    // Select the "The Closer" tab
    await page.click('text=The Closer');
    
    // Verify that the native composer renders
    await expect(page.locator('h3').first()).toContainText('Outreach Parameters');
    await expect(page.locator('text=Message Type')).toBeVisible();
  });

  test('Job Agent tab switches and renders dashboard', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('input[placeholder="e.g. admin"]', 'admin');
    await page.fill('input[placeholder="••••••••"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3000/');

    // Click the "Job Agent" tab
    await page.click('text=Job Agent');
    
    // Check that the dashboard renders
    await expect(page.locator('h2')).toContainText('Scraper Agent Dashboard');
    
    // Check that we see listings loaded from CSV
    await expect(page.locator('text=Senior React Developer').first()).toBeVisible();
    await expect(page.locator('text=Stitch AI').first()).toBeVisible();
  });

  test('Job Agent listings link to Closer and pre-populate fields', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('input[placeholder="e.g. admin"]', 'admin');
    await page.fill('input[placeholder="••••••••"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3000/');

    // Switch to Job Agent tab
    await page.click('text=Job Agent');
    await expect(page.locator('text=Senior React Developer').first()).toBeVisible();

    // Click "Tailor" next to "Senior React Developer"
    await page.locator('tr:has-text("Senior React Developer") button:has-text("Tailor")').first().click();

    // Verify redirection to The Closer tab and auto-populated input value
    await expect(page.locator('h3').first()).toContainText('Outreach Parameters');
    await expect(page.locator('input[placeholder="e.g. Senior Frontend Developer"]')).toHaveValue('Senior React Developer');
    await expect(page.locator('input[placeholder="e.g. Stitch AI"]')).toHaveValue('Google');
  });

  test('session logout clears tokens and redirects to login', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[placeholder="e.g. admin"]', 'admin');
    await page.fill('input[placeholder="••••••••"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3000/');

    // Click profile avatar to show logout dropdown
    await page.click('.user-avatar');
    
    // Click logout button
    await page.click('text=Sign Out');
    
    // Check redirection to login screen
    await expect(page).toHaveURL(/.*\/login/);
  });
});
