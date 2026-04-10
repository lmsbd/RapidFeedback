package com.unimelb.swen90017.rfo.pojo.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Mark record persistent object
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("mark_record")
public class MarkRecordPO {

    /**
     * Mark record ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * Linked project ID
     */
    private Long projectId;

    /**
     * Student primary key (references student.id)
     */
    private Long studentId;

    /**
     * Linked user ID (marker)
     */
    private Long markerId;

    /**
     * Weighted total score, calculated on submission
     */
    private BigDecimal totalScore;

    /**
     * Group score from group_mark_record, nullable
     */
    private BigDecimal groupScore;

    /**
     * Submission timestamp
     */
    private LocalDateTime markTime;
}