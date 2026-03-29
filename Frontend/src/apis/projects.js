import request from '@/utils/request';
/**
 * @param {string} subjectId
 * @returns {Promise<any>}
 */
export async function getProjectList(subjectId) {
  try {
    const res = await request.get(`/projects/getProjects`, {
      params: { subjectId },
    });
    return res.data;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Delete a project
 * @param {number|string} projectId
 * @returns {Promise<any>}
 */
export async function deleteProject(projectId) {
  const res = await request.delete(`/projects/${projectId}`);
  return res;
}

/**
 * Create project API
 * @param {object} data
 * @param {string} data.name - Project name
 * @param {string} data.description - Project description
 * @param {string} data.startDate - Start date
 * @param {string} data.dueDate - Due date
 * @param {number} data.maxScore - Maximum score
 * @param {number} data.timer - Presentation duration in minutes
 * @param {number} data.subjectId - Subject ID
 * @returns {Promise}
 */
export function createProject(data) {
  // Log detailed request data
  console.log('API Request - createProject:', {
    url: '/projects/save',
    requestData: JSON.stringify(data, null, 2)
  });
  
  return request.post('/projects/save', data);
}