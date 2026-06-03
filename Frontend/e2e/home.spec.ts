import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/BlueLearnerHub/);
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Learn')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check navigation links exist
    await expect(page.locator('text=Library')).toBeVisible();
    await expect(page.locator('text=Hackathons')).toBeVisible();
    await expect(page.locator('text=Spaces')).toBeVisible();
    await expect(page.locator('text=Mentors')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sign In');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should navigate to get started page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Get Started');
    await expect(page).toHaveURL(/\/get-started/);
  });
});

test.describe('Authentication', () => {
  test('should show login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Welcome back')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    await expect(page.locator('input:invalid').first()).toBeVisible();
  });

  test('should have OAuth login options', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=GitHub')).toBeVisible();
    await expect(page.locator('text=Google')).toBeVisible();
  });

  test('should link to forgot password', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Forgot password')).toBeVisible();
  });

  test('should link to registration', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Sign up free')).toBeVisible();
  });
});

test.describe('Corporate Portal', () => {
  test('should show corporate login option', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Corporate Login')).toBeVisible();
  });

  test('should navigate to corporate login', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Corporate Login');
    await expect(page).toHaveURL(/\/login\/corporate/);
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Mobile menu should be visible
    await expect(page.locator('[aria-label="Open menu"]')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('text=Library')).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('text=Library')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have skip to main content link', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a:has-text("Skip to main content")')).toBeAttached();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('label:has-text("Email")')).toBeVisible();
    await expect(page.locator('label:has-text("Password")')).toBeVisible();
  });
});
