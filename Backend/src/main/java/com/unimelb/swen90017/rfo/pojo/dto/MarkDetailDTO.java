package com.unimelb.swen90017.rfo.pojo.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * Mark detail DTO (one criteria score entry in a save mark request)
 */
@Data
public class MarkDetailDTO {

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
}