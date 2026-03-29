import request from '@/utils/request';

/**
 * Create subject API
 * @param {object} data
 * @param {string} data.name
 * @param {string} data.description
 * @param {Array} data.students
 * @param {Array} data.markerIds
 * @returns {Promise}
 */
export function createSubject(data) {
  // Detailed logging of sent data
  console.log('API Request - createSubject:', {
    url: '/subjects/save',
    requestData: JSON.stringify(data, null, 2)
  });
  
  return request.post('/subjects/save', data);
  
}
