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

}


