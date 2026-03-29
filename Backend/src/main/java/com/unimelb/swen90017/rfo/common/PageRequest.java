package com.unimelb.swen90017.rfo.common;

import lombok.Data;

/**
 * Pagination request parameter class
 */
@Data
public class PageRequest {
    
    /**
     * Page number, starting from 1
     */
    private Integer pageNum = 1;
    
    /**
     * Page size
     */
    private Integer pageSize = 10;
    
    /**
     * Sort field
     */
    private String orderBy;
    
    /**
     * Sort direction: ASC/DESC
     */
    private String orderDirection = "ASC";
    
    /**
     * Get offset
     */
    public Integer getOffset() {
        return (pageNum - 1) * pageSize;
    }
    
    /**
     * Get limit
     */
    public Integer getLimit() {
        return pageSize;
    }
}
