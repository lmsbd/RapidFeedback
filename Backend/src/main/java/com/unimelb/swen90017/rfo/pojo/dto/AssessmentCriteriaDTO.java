package com.unimelb.swen90017.rfo.pojo.dto;

import lombok.Data;

/**
 * Assessment criteria get request DTO
 */
@Data
public class AssessmentCriteriaDTO {
    /**
     * template ID
     */
    private Long templateId;
    /**
     * element ID
     */
    private Long elementId;

    /**
     * element name
     */
    private String name;
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