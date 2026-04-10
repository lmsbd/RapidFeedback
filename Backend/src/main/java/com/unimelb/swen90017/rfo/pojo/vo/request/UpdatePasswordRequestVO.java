package com.unimelb.swen90017.rfo.pojo.vo.request;

import lombok.Data;

/**
 * Update password request VO
 */
@Data
public class UpdatePasswordRequestVO {

    /**
     * User ID
     */
    private Long userId;

    /**
     * Old password for verification
     */
    private String oldPassword;

    /**
     * New password
     */
    private String newPassword;
}
