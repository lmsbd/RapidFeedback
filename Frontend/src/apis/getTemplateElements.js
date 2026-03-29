import request from '@/utils/request';

/**
 * Get template elements list (in form format)
 * @returns {Promise}
 */
export const getTemplateElements = () => {
  return request.get('/projects/getTemplateElementsList');
};

