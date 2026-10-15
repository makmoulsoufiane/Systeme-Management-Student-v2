import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import StaffApp from './StaffApp.jsx';
import { AuthProvider } from '../features/auth/application/AuthContext.jsx';
import { createSessionStore } from '../features/auth/application/sessionStore.js';

function LocationDisplay() {
  const { pathname, search, hash } = useLocation();
  return <output data-testid="location">{pathname}{search}{hash}</output>;
}

function open({ role = 'admin', mustChange = false, path = '/', session = true, me, list } = {}) {
  const user = { id: 1, username: 'alex', display_name: 'Alex Morgan', role, must_change_password: mustChange };
  const store = createSessionStore();
  if (session) store.set({ access: 'access', refresh: 'refresh', user });
  const auth = { me: me || vi.fn().mockResolvedValue({ user }), login: vi.fn().mockResolvedValue({ access: 'a', refresh: 'r', user }), logout: vi.fn().mockResolvedValue(null), changePassword: vi.fn().mockResolvedValue({ access: 'new', refresh: 'new-refresh', user: { ...user, must_change_password: false } }) };
  const gateway = { list: list || vi.fn().mockResolvedValue([]) };
  render(<MemoryRouter initialEntries={[path]}><LocationDisplay /><AuthProvider gateway={auth} store={store}><StaffApp gateway={gateway} accountGateway={auth} /></AuthProvider></MemoryRouter>);
  return { store, gateway, auth };
}

describe('role routes', () => {
  it.each(['admin', 'teacher', 'student'])('restores the %s session and opens its dashboard', async (role) => {
    open({ role });
    expect(await screen.findByRole('heading', { name: 'Welcome, Alex Morgan' })).toBeVisible();
    expect(screen.getByText(`${role[0].toUpperCase()}${role.slice(1)} portal`)).toBeVisible();
    expect(screen.getByTestId('location')).toHaveTextContent(role === 'teacher' ? '/teacher/1/dashboard' : `/${role}/dashboard`);
  });
  it('opens a teacher deep link and keeps its ID in navigation', async () => {
    open({ role: 'teacher', path: '/teacher/1/dashboard' });
    expect(await screen.findByRole('heading', { name: 'Welcome, Alex Morgan' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/teacher/1/dashboard');
    await userEvent.click(screen.getByRole('link', { name: /My students View/ }));
    expect(await screen.findByRole('heading', { name: 'No records assigned' })).toBeVisible();
    expect(screen.getByTestId('location')).toHaveTextContent('/teacher/1/records/students');
  });
  it.each(['/teacher/2/dashboard', '/teacher/2/records/students', '/teacher/hassan/dashboard'])(
    'rejects another or invalid teacher ID at %s before fetching records', async (path) => {
      const { gateway } = open({ role: 'teacher', path });
      expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeVisible();
      expect(gateway.list).not.toHaveBeenCalled();
      expect(screen.getByRole('link', { name: 'Return to my workspace' })).toHaveAttribute('href', '/teacher/1/dashboard');
    },
  );
  it('redirects old teacher bookmarks while preserving search and hash', async () => {
    open({ role: 'teacher', path: '/teacher/records/students?q=maya#results' });
    expect(await screen.findByRole('heading', { name: 'No records assigned' })).toBeVisible();
    expect(screen.getByTestId('location')).toHaveTextContent('/teacher/1/records/students?q=maya#results');
  });
  it('redirects teacher login to the account ID dashboard', async () => {
    open({ role: 'teacher', session: false });
    await userEvent.type(await screen.findByLabelText('Username'), 'alex');
    await userEvent.type(screen.getByLabelText('Password'), 'test-password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in to workspace' }));
    expect(await screen.findByRole('heading', { name: 'Welcome, Alex Morgan' })).toBeVisible();
    expect(screen.getByTestId('location')).toHaveTextContent('/teacher/1/dashboard');
  });
  it('returns a teacher to their ID dashboard after the required password change', async () => {
    open({ role: 'teacher', mustChange: true, path: '/teacher/1/dashboard' });
    await userEvent.type(await screen.findByLabelText('Current password'), 'old-password');
    await userEvent.type(screen.getByLabelText('New password'), 'new-password');
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'new-password');
    await userEvent.click(screen.getByRole('button', { name: 'Save new password' }));
    expect(await screen.findByRole('heading', { name: 'Welcome, Alex Morgan' })).toBeVisible();
    expect(screen.getByTestId('location')).toHaveTextContent('/teacher/1/dashboard');
  });
  it('does not fetch private data while verifying stored credentials', () => {
    const { gateway } = open({ path: '/admin/records/students', me: () => new Promise(() => {}) });
    expect(screen.getByRole('status')).toHaveTextContent('Opening your workspace');
    expect(gateway.list).not.toHaveBeenCalled();
  });
  it('redirects anonymous users to login', async () => {
    open({ path: '/teacher/dashboard', session: false });
    expect(await screen.findByLabelText('Username')).toBeVisible();
  });
  it('rejects a different role before rendering records', async () => {
    const { gateway } = open({ role: 'student', path: '/admin/records/students' });
    expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeVisible();
    expect(gateway.list).not.toHaveBeenCalled();
  });
  it('requires a password change before opening a dashboard', async () => {
    const { gateway } = open({ role: 'teacher', path: '/teacher/dashboard', mustChange: true });
    expect(await screen.findByRole('heading', { name: 'Change your password' })).toBeVisible();
    expect(gateway.list).not.toHaveBeenCalled();
  });
  it('recovers from a failed verification without exposing private data', async () => {
    open({ me: vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({ user: { username: 'alex', role: 'student', must_change_password: false } }) });
    expect(await screen.findByRole('alert')).toHaveTextContent('Offline');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('heading', { name: 'Welcome, alex' })).toBeVisible();
  });
  it('shows read-only records for teachers', async () => {
    open({ role: 'teacher', path: '/teacher/records/students' });
    expect(await screen.findByRole('heading', { name: 'No records assigned' })).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Add student' })).not.toBeInTheDocument();
  });
  it('clears the session when private requests report expiry', async () => {
    open({ path: '/admin/records/students', list: vi.fn().mockRejectedValue({ status: 401, message: 'Expired' }) });
    expect(await screen.findByLabelText('Username')).toBeVisible();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
