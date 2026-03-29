package com.unimelb.swen90017.rfo.pojo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Subject get request DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO {
    
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
    private long templateId;

}
