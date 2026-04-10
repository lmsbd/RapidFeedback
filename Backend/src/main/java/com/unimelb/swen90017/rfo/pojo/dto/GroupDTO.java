package com.unimelb.swen90017.rfo.pojo.dto;

import lombok.Data;

import java.util.List;

/**
 * Group get request DTO
 */
@Data
public class GroupDTO {
    /**
     * Group name
     */
    private String groupName;

    /**
     * Student IDs (student.id primary keys)
     */
    private List<Long> studentIds;

    /**
     * List of user.id for assigned markers (supports multiple markers per group)
     */
    private List<Long> markerIds;
}
