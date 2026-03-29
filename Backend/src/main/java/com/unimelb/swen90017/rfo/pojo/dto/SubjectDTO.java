package com.unimelb.swen90017.rfo.pojo.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

/**
 * Subject get request DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectDTO {
    
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
