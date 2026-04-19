package com.unimelb.swen90017.rfo.pojo.vo.request;

import lombok.Data;

import java.math.BigDecimal;

/**
 * Request VO for POST /api/finalMark/save
 */
@Data
public class SaveFinalMarkRequestVO {

    private Long projectId;

    /** student.id (PK) for individual projects */
    private Long studentId;

    /** project_group.id for group projects */
    private Long groupId;

    private BigDecimal finalScore;
}
