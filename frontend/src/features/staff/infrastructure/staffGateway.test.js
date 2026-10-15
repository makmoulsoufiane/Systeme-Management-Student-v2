import { describe, expect, it, vi } from 'vitest';
import { createStaffGateway } from './staffGateway.js';

describe('staff gateway', () => {
  it('retains server field errors and rejects HTML responses', async () => {
    const http = { request: vi.fn().mockRejectedValueOnce({ response: { status: 400, data: { message: 'Invalid fields', errors: { group: ['Choose a group.'] } } } })
      .mockResolvedValueOnce({ data: '<html>Login</html>' }) };
    const gateway = createStaffGateway(http);
    await expect(gateway.save('students', 1, {})).rejects.toMatchObject({ status: 400, fields: { group: ['Choose a group.'] } });
    await expect(gateway.list('students')).rejects.toMatchObject({ status: 502 });
  });
  it('handles deletion without a JSON body', async () => {
    const gateway = createStaffGateway({ request: vi.fn().mockResolvedValue({ status: 204, data: '' }) });
    await expect(gateway.remove('students', 1)).resolves.toBeNull();
  });
  it('rejects malformed records before they can crash presentation', async () => {
    const http = { request: vi.fn().mockResolvedValueOnce({ data: { results: [null] } })
      .mockResolvedValueOnce({ data: { record: { id_exam: 1, date_hour: 'invalid' } } }) };
    const gateway = createStaffGateway(http);
    await expect(gateway.list('students')).rejects.toMatchObject({ status: 502 });
    await expect(gateway.get('exams', 1)).rejects.toMatchObject({ status: 502 });
  });
});
