import request from '@/utils/request';

export function updateSubject(data) {
  return request.post('/subjects/updateSubjectsDetail', data).catch((error) => {
    throw error;
  });
}
