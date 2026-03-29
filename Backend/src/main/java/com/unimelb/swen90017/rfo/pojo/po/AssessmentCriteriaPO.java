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
 * Assessment criteria persistent object
 */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("assessment_criteria")
public class AssessmentCriteriaPO {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * template ID
     */
    private Long templateId;
    /**
     * element ID
     */
    private Long elementId;

    /**
     * Weighting
     */
    private Integer weighting;

    /**
     * Maximum mark
     */
    private Integer maximumMark;

    /**
     * Mark increments
     */
    private Double markIncrements;
}