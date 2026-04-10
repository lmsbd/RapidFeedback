package com.unimelb.swen90017.rfo.pojo.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Per-student mark data inside a group mark request.
 * Each student receives their own set of criteria scores.
 */
@Data
public class StudentMarkDTO {

    /**
     * Student primary key (student.id)
     */
    private Long studentId;

    /**
     * Per-criteria score entries for this student
     */
    private List<MarkDetailDTO> details;

    /**
     * Marker-overridable group score for this student (nullable).
     * Initially calculated as the average of all members' individual scores,
     * but the marker may adjust it per student before final submission.
     */
    private BigDecimal groupScore;
}
