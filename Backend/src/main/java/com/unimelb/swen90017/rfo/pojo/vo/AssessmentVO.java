package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.Data;

/**
 * Assessment item in project description (API: name, weighting, maxMark, markIncrements).
 */
@Data
public class AssessmentVO {
    private Long criteriaId;
    private String name;
    private Integer weighting;
    private Integer maxMark;
    private Double markIncrements;
}
