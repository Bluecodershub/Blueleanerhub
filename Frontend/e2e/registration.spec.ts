import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {
  test('should display registration form', async ({ page }) => {
    await page.goto('/get-started');
    await expect(page.locator('text=Create your account')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/get-started');
    await page.click('button[type="submit"]');
    await expect(page.locator('input:invalid').first()).toBeVisible();
  });

  test('should have password requirements', async ({ page }) => {
    await page.goto('/get-started');
    await expect(page.locator('text=8 characters minimum')).toBeVisible();
  });

  test('should navigate to login from registration', async ({ page }) => {
    await page.goto('/get-started');
    await page.click('text=Sign in instead');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should have OAuth registration options', async ({ page }) => {
    await page.goto('/get-started');
    await expect(page.locator('text=GitHub')).toBeVisible();
    await expect(page.locator('text=Google')).toBeVisible();
  });
});

test.describe('Registration Validation', () => {
  test('should show error for invalid email', async ({ page }) => {
    await page.goto('/get-started');
    await page.fill('input[type="email"]', 'invalid-email');
    await page.locator('input[type="email"]').blur();
    await expect(page.locator('text=valid email')).toBeVisible();
  });

  test('should show error for weak password', async ({ page }) => {
    await page.goto('/get-started');
    await page.fill('input[type="password"]', '123');
    await page.locator('input[type="password"]').blur();
    await expect(page.locator('text=8 characters')).toBeVisible();
  });

  test('should show error for password mismatch', async ({ page }) => {
    await page.goto('/get-started');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPass123!');
    await page.locator('input[name="confirmPassword"]').blur();
    await expect(page.locator('text=match')).toBeVisible();
  });
});

test.describe('Student Registration', () => {
  test('should have college name field for students', async ({ page }) => {
    await page.goto('/get-started');
    await expect(page.locator('text=College Name')).toBeVisible();
  });

  test('should have education level dropdown', async ({ page }) => {
    await page.goto('/get-started');
    await expect(page.locator('text=Education Level')).toBeVisible();
  });
});

test.describe('Corporate Registration', () => {
  test('should have company name field for corporate', async ({ page }) => {
    await page.goto('/get-started/corporate');
    await expect(page.locator('text=Company Name')).toBeVisible();
  });

  test('should validate organization email', async ({ page }) => {
    await page.goto('/get-started/corporate');
    await page.fill('input[type="email"]', 'user@gmail.com');
    await page.locator('input[type="email"]').blur();
    await expect(page.locator('text=Personal email')).toBeVisible();
  });

  test('should accept organization email', async ({ page }) => {
    await page.goto('/get-started/corporate');
    await page.fill('input[type="email"]', 'admin@techcorp.com');
    await expect(page.locator('text=Personal email')).not.toBeVisible();
  });
});
