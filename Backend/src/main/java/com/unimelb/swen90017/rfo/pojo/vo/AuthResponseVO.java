package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Authentication response VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseVO {

    /**
     * JWT token
     */
    private String token;

    /**
     * User ID
     */
    private Long userId;

    /**
     * Username
     */
    private String username;

    /**
     * Email
     */
    private String email;

    /**
     * User role
     */
    private Integer role;
}