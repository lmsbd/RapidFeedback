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
    /** Per-marker group comments. Empty list when no marker has written one. */
    private List<GroupCommentVO> groupComments;
    private List<DescriptionWithScoreVO> description;
}
