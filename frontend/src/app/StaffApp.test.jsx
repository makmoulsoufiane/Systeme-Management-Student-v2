import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import StaffApp from './StaffApp.jsx';

const staff = { id: 1, username: 'staff', display_name: 'Alex Morgan' };

function open(gateway, path = '/students') {
  render(<MemoryRouter initialEntries={[path]}><StaffApp gateway={gateway} /></MemoryRouter>);
}

describe('staff workspace states', () => {
  it('shows session loading instead of rendering private records', () => {
    const gateway = { session: () => new Promise(() => {}), list: vi.fn() };
    open(gateway);
    expect(screen.getByRole('status')).toHaveTextContent('Opening your workspace');
    expect(gateway.list).not.toHaveBeenCalled();
  });
  it('recovers from a failed session request', async () => {
    const gateway = { session: vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(null) };
    open(gateway);
    expect(await screen.findByRole('alert')).toHaveTextContent('Offline');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByLabelText('Username')).toBeVisible();
  });
  it('retries a failed resource request and renders the empty state', async () => {
    const gateway = { session: vi.fn().mockResolvedValue(staff), list: vi.fn()
      .mockRejectedValueOnce(new Error('Connection lost')).mockResolvedValueOnce([]) };
    open(gateway);
    expect(await screen.findByRole('alert')).toHaveTextContent('Connection lost');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('heading', { name: 'A fresh start for students' })).toBeVisible();
  });
  it('returns to login when a resource request reports session expiry', async () => {
    open({ session: vi.fn().mockResolvedValue(staff), list: vi.fn().mockRejectedValue({ status: 401, message: 'Expired' }) });
    expect(await screen.findByLabelText('Username')).toBeVisible();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
  it('offers recovery for an unknown route', async () => {
    open({ session: vi.fn().mockResolvedValue(staff) }, '/missing');
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'View students' })).toHaveAttribute('href', '/students');
  });
});
