import request from '@/utils/request';

function extractData(res) {
  if (res?.data !== undefined) return res.data;
  return res;
}

export async function getFinalMarkList(projectId) {
  try {
    const res = await request.get('/finalMark/list', {
      params: { projectId: Number(projectId) },
    });
    return extractData(res);
  } catch (error) {
    console.error('getFinalMarkList error:', error);
    return null;
  }
}

export async function saveFinalMark({ projectId, studentId, groupId, finalScore }) {
  return request.post('/finalMark/save', {
    projectId: Number(projectId),
    studentId: studentId != null ? Number(studentId) : null,
    groupId: groupId != null ? Number(groupId) : null,
    finalScore,
  });
}

export async function lockFinalMark({ projectId, studentId, groupId, isLocked }) {
  return request.post('/finalMark/lock', {
    projectId: Number(projectId),
    studentId: studentId != null ? Number(studentId) : null,
    groupId: groupId != null ? Number(groupId) : null,
    isLocked,
  });
}

export async function publishReport(projectId) {
  return request.post('/projects/sendReport', { projectId: Number(projectId) });
}
