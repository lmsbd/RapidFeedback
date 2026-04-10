package com.unimelb.swen90017.rfo.pojo.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * Per-student score entry inside a group mark request.
 */
@Data
public class GroupStudentMarkDTO {

    /**
     * Student primary key (student.id)
     */
    private Long studentId;

    /**
     * Group score directly assigned to this student by the marker
     */
    private BigDecimal groupScore;
}
