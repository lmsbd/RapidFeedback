package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.Data;

/**
 * Response VO for project
 */
@Data
public class ProjectResponseVO {
    /**
     * Project ID
     */
    private Long id;

    /**
     * Project name
     */
    private String name;

    /**
     * Project countdown
     */
    private Long countdown;

    /**
     * Subject ID
     */
    private Long subjectId;

    /**
     * Template ID
     */
    private Long templateId;

    private String projectType;

    /**
     * Marked count: number of students (individual project) or groups (group project)
     * already evaluated under the current viewer's perspective.
     */
    private Integer markedCount;

    /**
     * Unmarked count: number of students (individual project) or groups (group project)
     * still pending evaluation under the current viewer's perspective.
     */
    private Integer unmarkedCount;

}


