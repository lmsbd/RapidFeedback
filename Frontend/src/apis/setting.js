import request from '@/utils/request';

export function updateProfile({ userId, username }) {
  return request.post('/user/updateProfile', { userId, username });
}

export function changePassword({ userId, oldPassword, newPassword }) {
  return request.post('/user/updatePassword', { userId, oldPassword, newPassword });
}
