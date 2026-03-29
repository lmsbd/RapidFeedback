package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * description[] item for getStudentAssessmentScores (countdown + assessment with scores).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DescriptionWithScoreVO {
    private Long countdown;
    private List<AssessmentScoreItemVO> assessment;
}
