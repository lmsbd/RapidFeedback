package com.unimelb.swen90017.rfo.pojo.vo.request;

import lombok.Data;

/**
 * Request VO for getStudentAssessmentScores.
 * studentId is the business student number (student.student_id), same as saveMark.
 */
@Data
public class StudentAssessmentScoresRequestVO {
    private Long projectId;
    private Long studentId;
}
