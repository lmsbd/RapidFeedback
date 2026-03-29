package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.Data;

/**
 * @author: twitch zhu
 * @Date: 2025/10/12
 * @description: template's element. link to assessment criteria
 */
@Data
public class TemplateElementVO {
    /**
     * id
     */
    private Long id;

    /**
     * name
     */
    private String name;

    /**
     * weighting
     */
    private Integer weighting;

    /**
     * Maximum mark
     */
    private Integer maximumMark;

    /**
     * Mark increments
     */
    private Double markIncrements;
}
