package com.unimelb.swen90017.rfo.pojo.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Project persistent object
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("project")
public class ProjectPO {

    /**
     * Project ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * Project name
     */
    @TableField("project_name")
    private String name;

    /**
     * Project countdown
     */
    private Long countdown;

    /**
     * Subject ID
     */
    private Long subjectId;

    /**
     * Template ID
     */
    private long templateId;

    /**
     * Project type: individual or group
     */
    @TableField("project_type")
    private String projectType;

}
