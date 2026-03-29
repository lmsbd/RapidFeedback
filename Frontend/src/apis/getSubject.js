import request from '@/utils/request';

export function getSubjectsById(id) {
  return request.post(
    '/subjects/getSubjectById',
    { id }, // body: { id: 5 }
    { params: { id } } // query: ?id=5
  );
}

export function getSubjectsDetail(subjectId) {
  const numericId = Number(subjectId);
  if (!Number.isFinite(numericId)) {
    return Promise.reject(new Error(`Invalid subjectId: ${subjectId}`));
  }

  return request
    .get('/subjects/getSubjectsDetail', {
      params: { subjectId: numericId },
    })
    .catch((error) => {
      // Fallback: some backends expose this endpoint as POST despite docs.
      const status = error?.response?.status;
      if (status === 404 || status === 405 || status === 500) {
        return request.post(
          '/subjects/getSubjectsDetail',
          { subjectId: numericId },
          { params: { subjectId: numericId } }
        );
      }
      throw error;
    });
}

export async function getSubjectsByUser(id) {
  const res = await request.post('subjects/getSubjectList', { userId: id });
  return res.data;
}
