const administrator = { name: 'admin', label: 'Administrator', type: 'select', source: 'admins', required: true };
const enrollment = { name: 'date_of_inscription', label: 'Enrollment date', type: 'date', required: true };
const fullName = { name: 'fullname', label: 'Full name', required: true, maxLength: 100 };

export const resources = {
  students: {
    title: 'Students', singular: 'student', id: 'id_student', name: 'fullname', icon: 'students',
    description: 'Find students and manage their enrollment and group details.',
    fields: [fullName, { name: 'address', label: 'Address', required: true, maxLength: 255 }, enrollment,
      { ...administrator }, { name: 'group', label: 'Group', type: 'select', source: 'groups', required: true }],
    columns: [{ name: 'fullname', label: 'Student' }, { name: 'group_name', label: 'Group' },
      { name: 'date_of_inscription', label: 'Enrolled', type: 'date' }, { name: 'admin_name', label: 'Administrator' }],
  },
  teachers: {
    title: 'Teachers', singular: 'teacher', id: 'id_teacher', name: 'fullname', icon: 'teachers',
    description: 'Find teachers and update their staff records.',
    fields: [fullName, { name: 'adress', label: 'Address', required: true, maxLength: 255 }, enrollment,
      { ...administrator, required: false }],
    columns: [{ name: 'fullname', label: 'Teacher' }, { name: 'adress', label: 'Address' },
      { name: 'date_of_inscription', label: 'Joined', type: 'date' }, { name: 'admin_name', label: 'Administrator' }],
  },
  groups: {
    title: 'Groups', singular: 'group', id: 'id_group', name: 'name', icon: 'groups',
    description: 'Manage groups and assign their teachers.',
    fields: [{ name: 'name', label: 'Group name', required: true, maxLength: 100 },
      { name: 'year_of_creation', label: 'Year created', type: 'number', required: true, min: 0, step: 1 },
      { ...administrator }, { name: 'teacher', label: 'Teacher', type: 'select', source: 'teachers',
        hint: 'A teacher can be assigned to one group.' }],
    columns: [{ name: 'name', label: 'Group' }, { name: 'teacher_name', label: 'Teacher' },
      { name: 'year_of_creation', label: 'Year created' }, { name: 'admin_name', label: 'Administrator' }],
  },
  exams: {
    title: 'Exams', singular: 'exam', id: 'id_exam', name: 'name', icon: 'exams',
    description: 'Manage exam dates, locations, and assigned groups.',
    fields: [{ name: 'name', label: 'Exam name', required: true, maxLength: 255 },
      { name: 'date_hour', label: 'Date and time', type: 'datetime-local', step: 'any', required: true, hint: 'Shown in your local time zone.' },
      { name: 'place', label: 'Location', required: true, maxLength: 50 },
      { name: 'teacher', label: 'Teacher', type: 'select', source: 'teachers' },
      { name: 'group', label: 'Group', type: 'select', source: 'groups' }],
    columns: [{ name: 'name', label: 'Exam' }, { name: 'date_hour', label: 'Scheduled', type: 'datetime-local' },
      { name: 'place', label: 'Location' }, { name: 'group_name', label: 'Group' }],
  },
  scores: {
    title: 'Scores', singular: 'score', id: 'id', name: 'student_name', icon: 'scores',
    description: 'View and update student scores for each exam.',
    fields: [{ name: 'student', label: 'Student', type: 'select', source: 'students', required: true },
      { name: 'note', label: 'Score', type: 'number', step: 'any', required: true, hint: 'Use your institution’s grading scale.' },
      { name: 'exam', label: 'Exam', type: 'select', source: 'exams' },
      { name: 'teacher', label: 'Teacher', type: 'select', source: 'teachers' }, { ...administrator, required: false }],
    columns: [{ name: 'student_name', label: 'Student' }, { name: 'note', label: 'Score' },
      { name: 'exam_name', label: 'Exam' }, { name: 'teacher_name', label: 'Teacher' }],
  },
};

export function optionIdentity(source, record) {
  return { value: record[resources[source]?.id || 'id_admin'], label: record[resources[source]?.name || 'fullname'] };
}

export function formatValue(value, type) {
  if (value === null || value === undefined || value === '') return 'Not assigned';
  if (type === 'date') return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`));
  if (type === 'datetime-local') return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  return String(value);
}

export function initialValues(fields, record = {}) {
  return Object.fromEntries(fields.map((field) => {
    let value = record[field.name] ?? '';
    if (field.type === 'datetime-local' && value) {
      const date = new Date(value);
      value = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, -1);
    }
    return [field.name, String(value)];
  }));
}

export function formPayload(fields, values) {
  return Object.fromEntries(fields.map((field) => {
    const raw = values[field.name];
    const value = raw === '' && !field.required ? null
      : field.type === 'number' || field.type === 'select' ? Number(raw)
        : field.type === 'datetime-local' ? new Date(raw).toISOString() : raw.trim();
    return [field.name, value];
  }));
}
