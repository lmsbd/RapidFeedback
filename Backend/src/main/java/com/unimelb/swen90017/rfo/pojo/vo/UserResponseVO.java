package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.Data;

/**
 * Response VO for user
 */
@Data
public class UserResponseVO {
    /**
     * User ID
     */
    private Long userId;

    /**
     * User role
     */
    private Integer role;

    /**
     * User name
     */
    private String userName;

}