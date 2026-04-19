package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One marker's group-level comment for a group in a project.
 * Used by GroupAssessmentScoresResponseVO.groupComments and the group report PDF.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupCommentVO {
    private Long markerId;
    private String markerName;
    private String comment;
}
