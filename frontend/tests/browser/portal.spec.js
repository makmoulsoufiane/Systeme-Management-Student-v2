import { test, expect } from '@playwright/test';

async function signIn(page) {
  await page.goto('/');
  await page.getByLabel('Username').fill('browser-staff');
  await page.getByLabel('Password').fill('browser-tests-only');
  await page.getByRole('button', { name: 'Sign in to workspace' }).click();
  await expect(page).toHaveURL(/admin\/dashboard$/);
  await page.goto('/admin/records/students');
}

test('staff can sign in, search, navigate and sign out', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByLabel('Username')).toBeVisible();
  await page.screenshot({ path: `test-results/${info.project.name}-login.png`, fullPage: true });
  await page.getByLabel('Username').fill('browser-staff');
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in to workspace' }).click();
  await expect(page.getByRole('alert')).toContainText('No active account');
  await page.getByLabel('Password').fill('browser-tests-only');
  await page.getByRole('button', { name: 'Sign in to workspace' }).click();
  await expect(page).toHaveURL(/admin\/dashboard$/);
  await page.goto('/admin/records/students');
  await expect(page.getByRole('link', { name: /Maya Benali/ }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/${info.project.name}-students.png`, fullPage: true });
  await page.getByRole('searchbox').fill('Maya');
  await expect(page.getByRole('row')).toHaveCount(2);
  await page.getByRole('searchbox').fill('not-a-person');
  await expect(page.getByText('No matches found')).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await page.getByRole('link', { name: /Maya Benali/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Maya Benali' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Maya Benali' })).toBeVisible();
  if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByLabel('Username')).toBeVisible();
  expect(errors).toEqual([]);
});

test('staff can create, edit and delete every managed resource', async ({ page }, info) => {
  await signIn(page);
  const cases = [
    { resource: 'teachers', singular: 'teacher', fields: { 'Full name': `Test teacher ${info.project.name}`, Address: 'Campus', 'Enrollment date': '2026-09-01' }, nameField: 'Full name' },
    { resource: 'groups', singular: 'group', fields: { 'Group name': `Test group ${info.project.name}`, 'Year created': '2026' }, selects: { Administrator: 'School Office' }, nameField: 'Group name' },
    { resource: 'students', singular: 'student', fields: { 'Full name': `Test student ${info.project.name}`, Address: 'Campus', 'Enrollment date': '2026-09-01' }, selects: { Administrator: 'School Office', Group: 'Science A' }, nameField: 'Full name' },
    { resource: 'exams', singular: 'exam', fields: { 'Exam name': `Test exam ${info.project.name}`, 'Date and time': '2026-11-20T10:00', Location: 'Room 2' }, nameField: 'Exam name' },
    { resource: 'scores', singular: 'score', fields: { Score: '0' }, selects: { Student: 'Maya Benali' }, nameField: 'Score' },
  ];
  for (const item of cases) {
    await page.goto(`/admin/records/${item.resource}/new`);
    for (const [label, value] of Object.entries(item.fields)) await page.getByLabel(label, { exact: false }).fill(value);
    for (const [label, value] of Object.entries(item.selects || {})) await page.getByLabel(label, { exact: false }).selectOption({ label: value });
    if (item.resource === 'students') await page.screenshot({ path: `test-results/${info.project.name}-form.png`, fullPage: true });
    await page.getByRole('button', { name: `Save ${item.singular}` }).click();
    await expect(page.getByRole('heading', { name: 'Record details' })).toBeVisible();
    await page.getByRole('link', { name: `Edit ${item.singular}` }).click();
    const changed = item.resource === 'scores' ? '17.5' : `Updated ${item.singular} ${info.project.name}`;
    await page.getByLabel(item.nameField, { exact: false }).fill(changed);
    await page.getByRole('button', { name: `Save ${item.singular}` }).click();
    await expect(page.getByText(changed, { exact: true }).first()).toBeVisible();
    await page.getByRole('button', { name: `Delete ${item.singular}` }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Keep record' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await page.getByRole('button', { name: `Delete ${item.singular}` }).click();
    await page.getByRole('button', { name: 'Delete record', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/admin/records/${item.resource}$`));
  }
});

test('protects dependent records and supports keyboard and narrow layouts', async ({ page }, info) => {
  await signIn(page);
  await page.goto('/admin/records/groups/1');
  await expect(page.getByRole('heading', { name: 'Science A' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete group' }).click();
  await page.getByRole('button', { name: 'Delete record', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('linked account');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete group' })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  if (info.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('link', { name: 'Exams', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Exams.', exact: true })).toBeVisible();
  }
});
