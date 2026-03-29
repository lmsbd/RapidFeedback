package com.unimelb.swen90017.rfo.pojo.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("comment_library")
public class CommentLibraryPO {
    /**
     * comment id
     */
    @TableId(value = "id", type = IdType.AUTO)
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
     * comment Type
     */
    private Integer commentType;

    /**
     * delete: 1=deleted, 0=active DEFAULT 0
     */
    private Integer deleteStatus;

}
