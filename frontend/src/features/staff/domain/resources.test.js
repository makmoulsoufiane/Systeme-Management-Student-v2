import { describe, expect, it } from 'vitest';
import { formPayload, initialValues, optionIdentity, resources } from './resources.js';

describe('record form contracts', () => {
  it('keeps the Django teacher address name and converts optional relationships to null', () => {
    expect(formPayload(resources.teachers.fields, {
      fullname: '  Alex Kim ', adress: '  Main Street ', date_of_inscription: '2026-10-14', admin: '',
    })).toEqual({ fullname: 'Alex Kim', adress: 'Main Street', date_of_inscription: '2026-10-14', admin: null });
  });
  it('preserves a zero score and numeric relationship identifiers', () => {
    expect(formPayload(resources.scores.fields, { student: '7', note: '0', exam: '3', teacher: '', admin: '' }))
      .toEqual({ student: 7, note: 0, exam: 3, teacher: null, admin: null });
  });
  it('round-trips an exam time without shifting the instant', () => {
    const record = { name: 'Exam', place: 'Room 1', date_hour: '2026-10-14T12:30:45.123Z', teacher: null, group: null };
    expect(formPayload(resources.exams.fields, initialValues(resources.exams.fields, record)).date_hour)
      .toBe('2026-10-14T12:30:45.123Z');
  });
  it('uses native primary keys for relationship options', () => {
    expect(optionIdentity('students', { id_student: 4, fullname: 'Lina' })).toEqual({ value: 4, label: 'Lina' });
    expect(optionIdentity('admins', { id_admin: 2, fullname: 'Office' })).toEqual({ value: 2, label: 'Office' });
  });
});
