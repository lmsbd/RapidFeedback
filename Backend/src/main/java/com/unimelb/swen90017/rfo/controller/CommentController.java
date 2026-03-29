package com.unimelb.swen90017.rfo.controller;

import com.unimelb.swen90017.rfo.common.Result;
import com.unimelb.swen90017.rfo.pojo.vo.CommentVO;
import com.unimelb.swen90017.rfo.pojo.vo.TemplateElementVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.CommentListGetByCriteriaIdRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.CommentListGetRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.CommentSaveRequestVO;
import com.unimelb.swen90017.rfo.service.CommentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/comment")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping("/getCommentLibraryList")
    public Result<List<TemplateElementVO>> getCommentLibraryList() throws Exception {
        log.info("Get CommentLibraryList");
        try {
            List<TemplateElementVO> commentLibraryList = commentService.getTemplateElementList();
            return Result.success(commentLibraryList);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/getCommentList")
    public Result<List<CommentVO>> getCommentList(@RequestBody CommentListGetRequestVO commentListGetRequestVO) throws Exception {
        log.info("Get CommentList");
        try {
            List<CommentVO> commentList = commentService.getCommentList(commentListGetRequestVO);
            return Result.success(commentList);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/getCommentListByCriteriaId")
    public Result<List<CommentVO>> getCommentListByCriteriaId(@RequestBody CommentListGetByCriteriaIdRequestVO commentListVO) throws Exception {
        log.info("Get CommentListByCriteriaId");
        try {
            List<CommentVO> commentList = commentService.getCommentListByCriteriaId(commentListVO);
            return Result.success(commentList);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/saveComment")
    public Result saveComment(@RequestBody CommentSaveRequestVO commentSaveRequestVO) throws Exception {
        log.info("Save Comment {}", commentSaveRequestVO);
        try {
            commentService.saveComment(commentSaveRequestVO);
            return Result.success();
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }

    }

    @PostMapping("/deleteComment")
    public Result deleteComment(@RequestBody CommentSaveRequestVO commentSaveRequestVO) throws Exception {
        log.info("Delete Comment {}", commentSaveRequestVO.getId());
        try {
            commentService.deleteComment(commentSaveRequestVO.getId());
            return Result.success();
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

}
