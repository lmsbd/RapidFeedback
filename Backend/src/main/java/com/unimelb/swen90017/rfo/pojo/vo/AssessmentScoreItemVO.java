package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * One rubric line in getStudentAssessmentScores response.
 * Mirrors assessment_criteria fields, with score from mark_detail (null if not graded).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentScoreItemVO {

    /** assessment_criteria.id */
    private Long criteriaId;

    /** template_element_name */
    private String name;

    private Integer weighting;

    private Integer maxMark;

    private Double markIncrements;

    /** null when not graded; mark_detail.score when graded */
    private BigDecimal score;

    /** null when not graded; mark_detail/group_mark_detail.comment when graded */
    private String comment;
}
