import request from '@/utils/request';

/**
 * Get comment library list (template elements)
 * @returns {Promise}
 */
export const getCommentLibraryList = () => {
  return request.post('/comment/getCommentLibraryList');
};

/**
 * Get comment list by template element ID
 * @param {number} templateElementId - Template element ID
 * @returns {Promise}
 */
export const getCommentList = (templateElementId) => {
  return request.post('/comment/getCommentList', {
    templateElementId
  });
};

/**
 * Save or update comment
 * @param {object} data - Comment data
 * @param {number|null} data.id - Comment ID (null for new comment)
 * @param {number} data.templateElementId - Template element ID
 * @param {string} data.content - Comment content
 * @param {number} data.commentType - Comment type (2=positive, 1=neutral, 0=negative)
 * @returns {Promise}
 */
export const saveComment = (data) => {
  return request.post('/comment/saveComment', data);
};

/**
 * Delete comment (soft delete)
 * @param {number} commentId - Comment ID to delete
 * @returns {Promise}
 */
export const deleteComment = (commentId) => {
  return request.post('/comment/deleteComment', {
    id: commentId
  });
};

export const getCommentListByCriteriaId = (criteriaId) => {
  return request.post('/comment/getCommentListByCriteriaId', {
    criteriaId,
  });
};
