package com.unimelb.swen90017.rfo.pojo.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Mark detail persistent object
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("mark_detail")
public class MarkDetailPO {

    /**
     * Mark detail ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * Linked mark_record ID
     */
    private Long markRecordId;

    /**
     * Linked assessment_criteria ID
     */
    private Long criteriaId;

    /**
     * Score for this criteria
     */
    private BigDecimal score;

    /**
     * Comment for this criteria
     */
    private String comment;

    /**
     * Status: 0=changed (saved by marker), 1=submitted (confirmed by admin)
     */
    private Integer status;
}