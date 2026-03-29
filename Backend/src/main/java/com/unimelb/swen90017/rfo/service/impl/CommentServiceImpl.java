package com.unimelb.swen90017.rfo.service.impl;

import com.unimelb.swen90017.rfo.dao.CommentLibraryDao;
import com.unimelb.swen90017.rfo.dao.TemplateElementDao;
import com.unimelb.swen90017.rfo.pojo.po.CommentLibraryPO;
import com.unimelb.swen90017.rfo.pojo.po.TemplateElementPO;
import com.unimelb.swen90017.rfo.pojo.vo.CommentVO;
import com.unimelb.swen90017.rfo.pojo.vo.TemplateElementVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.CommentListGetByCriteriaIdRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.CommentListGetRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.CommentSaveRequestVO;
import com.unimelb.swen90017.rfo.service.CommentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private TemplateElementDao templateElementDao;

    @Autowired
    private CommentLibraryDao commentLibraryDao;

    @Override
    public List<TemplateElementVO> getTemplateElementList() throws Exception {
        try {
            List<TemplateElementPO> templateElementList = templateElementDao.selectList(null);

            List<TemplateElementVO> templateElementVOList = new ArrayList<>();
            for (TemplateElementPO templateElementPO : templateElementList) {
                TemplateElementVO elementVO = new TemplateElementVO();
                BeanUtils.copyProperties(templateElementPO, elementVO);
                templateElementVOList.add(elementVO);
            }
            return templateElementVOList;
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception("Failed to getTemplateInfo: " + e.getMessage(), e);
        }
    }

    @Override
    public List<CommentVO> getCommentList(CommentListGetRequestVO commentListGetRequestVO) throws Exception {
        if (commentListGetRequestVO == null || commentListGetRequestVO.getTemplateElementId() == null) {
            throw new Exception("TemplateElementId is null");
        }
        try {
            Long templateElementId = commentListGetRequestVO.getTemplateElementId();
            List<CommentLibraryPO> commentList = commentLibraryDao.findByTemplateElementId(templateElementId);

            List<CommentVO> commentVOList = new ArrayList<>();
            for (CommentLibraryPO commentLibraryPO : commentList) {
                CommentVO commentVO = new CommentVO();
                BeanUtils.copyProperties(commentLibraryPO, commentVO);
                commentVOList.add(commentVO);
            }
            return commentVOList;
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception("Failed to get comment list: " + e.getMessage(), e);
        }
    }

    @Override
    public List<CommentVO> getCommentListByCriteriaId(CommentListGetByCriteriaIdRequestVO commentListGetRequestVO) throws Exception {
        if (commentListGetRequestVO == null || commentListGetRequestVO.getCriteriaId() == null) {
            throw new Exception("criteriaId is null");
        }
        try {
            Long criteriaId = commentListGetRequestVO.getCriteriaId();
            List<CommentLibraryPO> commentList = commentLibraryDao.findByCriteriaId(criteriaId);

            List<CommentVO> commentVOList = new ArrayList<>();
            for (CommentLibraryPO commentLibraryPO : commentList) {
                CommentVO commentVO = new CommentVO();
                BeanUtils.copyProperties(commentLibraryPO, commentVO);
                commentVOList.add(commentVO);
            }
            return commentVOList;
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception("Failed to get comment list: " + e.getMessage(), e);
        }
    }

    @Override
    public void saveComment(CommentSaveRequestVO commentSaveRequestVO) throws Exception {
        if (commentSaveRequestVO == null) {
            throw new Exception("Can't find any Save Parameters!");
        }
        try {
            CommentLibraryPO commentLibraryPO = new CommentLibraryPO();
            BeanUtils.copyProperties(commentSaveRequestVO, commentLibraryPO);
            // create
            if (commentSaveRequestVO.getId() == null) {
                int result = commentLibraryDao.insert(commentLibraryPO);
                if (result != 1) {
                    throw new Exception("Failed to save Comment!");
                }
            } else {
                int result = commentLibraryDao.updateById(commentLibraryPO);
                if (result != 1) {
                    throw new Exception("Failed to update Comment!");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception("Failed to saveComment: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteComment(Long commentId) throws Exception {
        if (commentId == null) {
            throw new Exception("Comment ID is null");
        }
        try {
            // Soft delete: set deleteStatus to 1
            CommentLibraryPO comment = commentLibraryDao.selectById(commentId);
            if (comment == null) {
                throw new Exception("Comment not found");
            }
            comment.setDeleteStatus(1);
            int result = commentLibraryDao.updateById(comment);
            if (result != 1) {
                throw new Exception("Failed to delete comment");
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception("Failed to deleteComment: " + e.getMessage(), e);
        }
    }
}
