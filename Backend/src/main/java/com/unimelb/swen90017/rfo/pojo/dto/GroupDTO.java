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
     * Student IDs
     */
    private List<Long> studentIds;
}
