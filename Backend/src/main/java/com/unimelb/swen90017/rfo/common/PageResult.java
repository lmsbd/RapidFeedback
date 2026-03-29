package com.unimelb.swen90017.rfo.common;

import lombok.Data;
import java.util.List;

/**
 * Pagination response result class
 * @param <T> Data type
 */
@Data
public class PageResult<T> {
    
    /**
     * Current page number
     */
    private Integer pageNum;
    
    /**
     * Page size
     */
    private Integer pageSize;
    
    /**
     * Total number of records
     */
    private Long total;
    
    /**
     * Total number of pages
     */
    private Integer totalPages;
    
    /**
     * Data list
     */
    private List<T> list;
    
    /**
     * Whether has next page
     */
    private Boolean hasNext;
    
    /**
     * Whether has previous page
     */
    private Boolean hasPrev;
    
    public PageResult() {}
    
    public PageResult(Integer pageNum, Integer pageSize, Long total, List<T> list) {
        this.pageNum = pageNum;
        this.pageSize = pageSize;
        this.total = total;
        this.list = list;
        this.totalPages = (int) Math.ceil((double) total / pageSize);
        this.hasNext = pageNum < totalPages;
        this.hasPrev = pageNum > 1;
    }
    
    /**
     * Create pagination result
     */
    public static <T> PageResult<T> of(Integer pageNum, Integer pageSize, Long total, List<T> list) {
        return new PageResult<>(pageNum, pageSize, total, list);
    }
}
