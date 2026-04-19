package com.unimelb.swen90017.rfo.pojo.vo.request;

import lombok.Data;

/**
 * Request VO for POST /api/finalMark/lock
 */
@Data
public class LockFinalMarkRequestVO {

    private Long projectId;

    /** student.id (PK) for individual projects */
    private Long studentId;

    /** project_group.id for group projects */
    private Long groupId;

    private Boolean isLocked;
}
