import { test, expect } from '@playwright/test';

async function login(page, username, password = 'browser-tests-only') {
  await page.goto('/login');
  await page.getByLabel('Username', { exact: true }).fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in to workspace' }).click();
}

for (const role of ['teacher', 'student']) {
  test(`${role} has a private dashboard, persists refresh, and cannot open admin pages`, async ({ page }, info) => {
    await login(page, `browser-${role}`);
    await expect(page).toHaveURL(new RegExp(role === 'teacher' ? '/teacher/[0-9]+/dashboard$' : '/student/dashboard$'));
    await page.screenshot({ path: `test-results/${info.project.name}-${role}-dashboard.png`, fullPage: true });
    await page.reload();
    await expect(page.getByRole('heading', { name: `Welcome, browser-${role}` })).toBeVisible();
    await page.goto(`/${role}/records/students`);
    await expect(page.getByRole('link', { name: /Maya Benali/ }).first()).toBeVisible();
    await expect(page.getByText('Private student')).toHaveCount(0);
    if (role === 'student') await expect(page.getByText('Adam Laurent')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Add student' })).toHaveCount(0);
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/unauthorized$/);
    await expect(page.getByRole('heading', { name: 'Access denied' })).toBeVisible();
  });
}

test('admin creates, edits and deactivates an account; first login requires password change', async ({ page, browser }, info) => {
  const username = `new-student-${info.project.name}`;
  const temporary = 'Temporary-access-938!';
  const changed = 'Changed-access-739!';
  await login(page, 'browser-staff');
  await expect(page).toHaveURL(/admin\/dashboard$/);
  await page.goto('/admin/students/new');
  await page.getByLabel('Student school record').selectOption({ label: info.project.name === 'desktop' ? 'Adam Laurent' : 'Lina Mansouri' });
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Temporary password').fill(temporary);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page).toHaveURL(/admin\/students$/);
  await page.getByRole('link', { name: `Edit ${username}` }).click();
  await page.getByLabel('Email').fill('learner@example.com');
  await page.getByRole('button', { name: 'Save account' }).click();
  await expect(page.getByText('learner@example.com').first()).toBeVisible();
  await page.screenshot({ path: `test-results/${info.project.name}-accounts.png`, fullPage: true });

  const context = await browser.newContext();
  const student = await context.newPage();
  try {
    await login(student, username, temporary);
    await expect(student).toHaveURL(/change-password$/);
    await student.goto('/student/dashboard');
    await expect(student).toHaveURL(/change-password$/);
    await student.getByLabel('Current password', { exact: true }).fill(temporary);
    await student.getByLabel('New password', { exact: true }).fill(changed);
    await student.getByLabel('Confirm new password').fill(changed);
    await student.getByRole('button', { name: 'Save new password' }).click();
    await expect(student).toHaveURL(/student\/dashboard$/, { timeout: 20000 });
    await student.reload();
    await expect(student.getByRole('heading', { name: `Welcome, ${username}` })).toBeVisible();
    await page.getByRole('button', { name: `Deactivate ${username}`, exact: true }).click();
    await page.getByRole('button', { name: 'Deactivate account', exact: true }).click();
    await expect(page.getByRole('row').filter({ hasText: username })).toContainText('Inactive');
    await student.reload();
    await expect(student).toHaveURL(/login$/);
  } finally { await context.close(); }
});
