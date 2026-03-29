package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.Data;

@Data
public class CommentVO {

    /**
     * comment Id
     */
    private Long id;

    /**
     * comment content
     */
    private String content;

    /**
     * comment Type: 2=positive, 1=neutral, 0=negative
     */
    private Integer commentType;
}
