package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response VO for POST /api/projects/getGroupAssessmentScores.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupAssessmentScoresResponseVO {
    private Long projectId;
    private String projectName;
    private String projectType;
    private Long groupId;
    private String groupName;
    private List<DescriptionWithScoreVO> description;
}
