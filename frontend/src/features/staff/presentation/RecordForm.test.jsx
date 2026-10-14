import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Editor } from './RecordForm.jsx';
import { resources } from '../domain/resources.js';

describe('record editing', () => {
  it('keeps values and shows field errors when the server rejects a save', async () => {
    const gateway = { save: vi.fn().mockRejectedValue({ message: 'Correct the highlighted fields.', fields: { fullname: ['This name is invalid.'] } }) };
    render(<MemoryRouter><Editor config={resources.teachers} resource="teachers" record={{ id_teacher: 1, fullname: 'Lina', adress: 'Main street', date_of_inscription: '2026-10-14', admin: null }} options={{ admins: [] }} gateway={gateway} onSessionExpired={vi.fn()} onSaved={vi.fn()} back="/teachers" /></MemoryRouter>);
    await userEvent.click(screen.getByRole('button', { name: /save teacher/i }));
    expect(await screen.findByText('This name is invalid.')).toBeVisible();
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Lina');
    expect(screen.getByLabelText(/full name/i)).toHaveAttribute('aria-invalid', 'true');
  });
  it('blocks a student save when a required lookup has no records', () => {
    render(<MemoryRouter><Editor config={resources.students} resource="students" record={null} options={{ admins: [], groups: [] }} gateway={{}} onSessionExpired={vi.fn()} onSaved={vi.fn()} back="/students" /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /save student/i })).toBeDisabled();
    expect(screen.getByText(/administrator record is required/i)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Add group' })).toHaveAttribute('href', '/groups/new');
  });
  it('does not navigate back after a save completes on an unmounted form', async () => {
    let finishSave;
    const gateway = { save: vi.fn(() => new Promise((resolve) => { finishSave = resolve; })) };
    const onSaved = vi.fn();
    const { unmount } = render(<MemoryRouter><Editor config={resources.teachers} resource="teachers" record={{ id_teacher: 1, fullname: 'Lina', adress: 'Main street', date_of_inscription: '2026-10-14' }} options={{ admins: [] }} gateway={gateway} onSessionExpired={vi.fn()} onSaved={onSaved} back="/teachers" /></MemoryRouter>);
    await userEvent.click(screen.getByRole('button', { name: /save teacher/i }));
    unmount();
    await act(async () => { finishSave({ id_teacher: 1 }); });
    expect(onSaved).not.toHaveBeenCalled();
  });
});
