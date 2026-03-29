package com.unimelb.swen90017.rfo.pojo.vo.request;

import lombok.Data;

/**
 * Request VO for POST /api/projects/getGroupAssessmentScores.
 */
@Data
public class GroupAssessmentScoresRequestVO {
    private Long projectId;
    private Long groupId;
}
