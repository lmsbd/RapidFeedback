package com.unimelb.swen90017.rfo.pojo.dto;

import lombok.Data;

import java.util.List;

/**
 * DTO for per-student marker assignment in individual projects
 */
@Data
public class MarkerStudentDTO {
    /**
     * student.id (database primary key)
     */
    private Long studentId;

    /**
     * List of user.id for assigned markers
     */
    private List<Long> markerIds;
}
