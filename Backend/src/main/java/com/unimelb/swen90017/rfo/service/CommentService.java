package com.unimelb.swen90017.rfo.service;

import com.unimelb.swen90017.rfo.pojo.vo.CommentVO;
import com.unimelb.swen90017.rfo.pojo.vo.TemplateElementVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.CommentListGetByCriteriaIdRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.CommentListGetRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.CommentSaveRequestVO;

import java.util.List;

public interface CommentService {

    /**
     * get template elements
     * @return list
     * @throws Exception
     */
    List<TemplateElementVO> getTemplateElementList() throws Exception;

    /**
     * get comment by templateElementId
     * @return
     * @throws Exception
     */
    List<CommentVO> getCommentList(CommentListGetRequestVO commentListGetRequestVO) throws Exception;

    /**
     * get comment by templateElementId
     * @return
     * @throws Exception
     */
    List<CommentVO> getCommentListByCriteriaId(CommentListGetByCriteriaIdRequestVO commentListGetRequestVO) throws Exception;

    /**
     * save comment
     * @param commentSaveRequestVO
     * @throws Exception
     */
    void saveComment(CommentSaveRequestVO commentSaveRequestVO) throws Exception;

    /**
     * delete comment (soft delete)
     * @param commentId
     * @throws Exception
     */
    void deleteComment(Long commentId) throws Exception;
}
