package com.unimelb.swen90017.rfo.pojo.vo;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GroupWithStudentResponseVO {

    /**
     * Group ID
     */
    private Long id;

    /**
     * Group name
     */
    private String name;

    /**
     * Markers assigned to this group (from marker_group), only populated in getProjectDetail
     */
    private List<UserDetailVO> markers;

    /**
     * Students
     */
    private List<StudentResponseVO> students;
}
