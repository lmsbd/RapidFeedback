package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response VO for POST /api/projects/getStudentAssessmentScores.
 * Structure mirrors getProjectDetail (168 branch) with score added to each assessment item.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAssessmentScoresResponseVO {
    private Long projectId;
    private String projectName;
    private String projectType;
    private List<DescriptionWithScoreVO> description;
}
