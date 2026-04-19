package com.unimelb.swen90017.rfo.pojo.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Group mark record persistent object
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("group_mark_record")
public class GroupMarkRecordPO {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private Long projectId;

    private Long groupId;

    /** user.id of the marker who wrote this group comment */
    private Long markerId;

    private String comment;

    private LocalDateTime markTime;
}
