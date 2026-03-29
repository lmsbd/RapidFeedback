package com.unimelb.swen90017.rfo.pojo.vo.request;

import lombok.Data;

/**
 * @author: twitch zhu
 * @Date: 2025/10/12
 * @description: /comment/saveComment
 */
@Data
public class CommentSaveRequestVO {

    /**
     * comment Id
     * if id != null, it means update the comment
     * if id == null, it means create a new comment
     */
    private Long id;

    /**
     * templateElementId
     */
    private Long templateElementId;

    /**
     * comment content
     */
    private String content;

    /**
     * comment Type: 2=positive, 1=neutral, 0=negative
     */
    private Integer commentType;
}
