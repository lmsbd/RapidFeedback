import request from '@/utils/request';

export function saveMark(data) {
  return request.post('/mark/saveMark', data);
}

export function saveGroupMark(data) {
  return request.post('/mark/saveGroupMark', data);
}

export function getGroupMark(projectId, groupId) {
  return request.get('/mark/getGroupMark', {
    params: {
      projectId: Number(projectId),
      groupId: Number(groupId),
    },
  });
}
