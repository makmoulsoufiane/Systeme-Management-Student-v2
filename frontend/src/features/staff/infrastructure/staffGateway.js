import { apiRequest, ApiError } from '../../../services/apiRequest.js';
import { resources } from '../domain/resources.js';
export { ApiError } from '../../../services/apiRequest.js';

export function createStaffGateway(http) {
  const request = (config) => apiRequest(http, config);

  function validateRecord(resource, record) {
    const idKey = resources[resource]?.id || 'id_admin';
    if (!record || Array.isArray(record) || !Number.isInteger(record[idKey])) {
      throw new ApiError('The server returned an invalid record.', 502);
    }
    for (const field of resources[resource]?.fields || []) {
      if ((field.type === 'date' || field.type === 'datetime-local') && record[field.name] != null
        && !Number.isFinite(Date.parse(record[field.name]))) {
        throw new ApiError('The server returned an invalid date.', 502);
      }
    }
    return record;
  }

  async function recordRequest(resource, config) {
    const result = await request(config);
    if (!result.record || typeof result.record !== 'object') {
      throw new ApiError('The server returned an invalid record.', 502);
    }
    return validateRecord(resource, result.record);
  }

  return {
    async list(resource, signal) {
      const result = await request({ url: `${resource}/`, signal });
      if (!Array.isArray(result.results)) throw new ApiError('The server returned an invalid list.', 502);
      return result.results.map((record) => validateRecord(resource, record));
    },
    get: (resource, id, signal) => recordRequest(resource, { url: `${resource}/${encodeURIComponent(id)}/`, signal }),
    save: (resource, id, values) => recordRequest(resource, {
      url: id ? `${resource}/${encodeURIComponent(id)}/` : `${resource}/`,
      method: id ? 'PATCH' : 'POST', data: values,
    }),
    remove: (resource, id) => request({ url: `${resource}/${encodeURIComponent(id)}/`, method: 'DELETE' }),
  };
}
