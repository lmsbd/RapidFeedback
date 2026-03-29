import request from '@/utils/request';

export function saveMark(data) {
  return request.post('/mark/saveMark', data);
}

export function saveGroupMark(data) {
  return request.post('/mark/saveGroupMark', data);
}
