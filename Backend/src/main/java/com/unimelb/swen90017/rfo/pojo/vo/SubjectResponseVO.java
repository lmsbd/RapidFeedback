package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Response VO for subject
 */
@Data
public class SubjectResponseVO {
    /**
     * Subject ID
     */
    private Long id;

    /**
     * Subject name
     */
    private String name;

    /**
     * Subject description
     */
    private String description;

}


