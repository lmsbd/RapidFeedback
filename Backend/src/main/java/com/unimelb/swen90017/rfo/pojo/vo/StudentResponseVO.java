package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class StudentResponseVO {
    /**
     * student id in database
     */
    private Long id;

    /**
     * studentId
     */
    private Long studentId;

    /**
     * email
     */
    private String email;

    /**
     * first name
     */
    private String firstName;

    /**
     * sur name
     */
    private String surname;

    /**
     * total score, only returned for marked students
     */
    private BigDecimal totalScore;

    /**
     * per-marker scores, only populated for Admin role in getMarkedStudentList
     */
    private List<MarkerScoreVO> markerScores;
}
