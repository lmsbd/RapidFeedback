import request from '@/utils/request';

function extractList(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

/**
 * @param {number} projectId
 * @returns {Promise<Array>}
 */
export async function getUnmarkedStudentList(projectId) {
  try {
    const numericProjectId = parseInt(projectId);
    const res = await request.post('/projects/getUnmarkedStudentList', {
      projectId: numericProjectId,
    });
    return extractList(res);
  } catch (error) {
    console.error('getUnmarkedStudentList error:', error);
    return [];
  }
}

/**
 * @param {number} projectId
 * @returns {Promise<Array>}
 */
export async function getMarkedStudentList(projectId) {
  try {
    const numericProjectId = parseInt(projectId);
    const res = await request.post('/projects/getMarkedStudentList', {
      projectId: numericProjectId,
    });
    return extractList(res);
  } catch (error) {
    console.error('getMarkedStudentList error:', error);
    return [];
  }
}

/**
 * @param {number} projectId
 * @returns {Promise<Array>}
 */
export async function getUnmarkedGroupList(projectId) {
  try {
    const numericProjectId = parseInt(projectId, 10);
    const res = await request.post('/projects/getUnmarkedGroupList', {
      projectId: numericProjectId,
    });
    return extractList(res);
  } catch (error) {
    console.error('getUnmarkedGroupList error:', error);
    return [];
  }
}

/**
 * @param {number} projectId
 * @returns {Promise<Array>}
 */
export async function getMarkedGroupList(projectId) {
  try {
    const numericProjectId = parseInt(projectId, 10);
    const res = await request.post('/projects/getMarkedGroupList', {
      projectId: numericProjectId,
    });
    return extractList(res);
  } catch (error) {
    console.error('getMarkedGroupList error:', error);
    return [];
  }
}

export async function getStudentListBySubject(id) {
  const res = await request.post('subjects/getStudentList', { subjectId: id });
  console.log(res.data);
  return res.data;
}
