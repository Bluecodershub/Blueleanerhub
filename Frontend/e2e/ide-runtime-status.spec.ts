import { expect, test } from '@playwright/test';

test.describe('Student IDE runtime readiness', () => {
  test('shows local Python runtime as ready when Judge0 is not configured in development', async ({ page }) => {
    const login = await page.request.post('http://localhost:5000/api/v1/auth/login', {
      data: {
        email: 'student@bluelearnerhub.com',
        password: 'Password123!',
      },
    });
    expect(login.ok()).toBeTruthy();
    await page.context().addCookies([
      {
        name: 'auth_hint',
        value: '1',
        url: 'http://localhost:3000',
      },
    ]);

    await page.goto('/ide');

    await expect(page.getByText('local-python ready')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeEnabled();
  });
});
