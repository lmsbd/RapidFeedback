import request from '@/utils/request';

export function getAllMarkers() {
  return request.post('/user/getAllMarkers');
  // return Promise.resolve({
  //   code: 200,
  //   msg: 'success',
  //   data: [
  //     { userId: 1001, role: 1, userName: 'Alice' },
  //     { userId: 1002, role: 2, userName: 'Bob' },
  //     { userId: 1003, role: 2, userName: 'Charlie' },
  //     { userId: 1004, role: 1, userName: 'David' },
  //   ],
  // });
}
