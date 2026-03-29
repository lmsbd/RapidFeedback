package com.unimelb.swen90017.rfo.pojo.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateDTO {
    /**
     * Template Name
     */
    private String templateName;
    /**
     * creator ID
     */
    private Long creatorId;
}
