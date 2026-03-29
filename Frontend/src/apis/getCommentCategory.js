import request from '@/utils/request';
export function getCategoryById(id) {
  return request.post(
    '/commentLibrary/getCategoryById',
    { id }, // body: { id: 5 }
    { params: { id } } // query: ?id=5
  );
}
