package com.unimelb.swen90017.rfo.pojo.vo.request;

import lombok.Data;

import java.util.List;

/**
 * Request VO for assigning users to subject
 */
@Data
public class SubjectUserRequestVO {
    /**
     * Subject ID
     */
    private Long subjectId;

    /**
     * List of user IDs to be assigned to this subject
     */
    private List<Long> userIds;
}