package com.unimelb.swen90017.rfo.pojo.vo.request;

import lombok.Data;

/**
 * Register request VO
 */
@Data
public class RegisterRequestVO {

    /**
     * Username
     */
    private String username;

    /**
     * Password
     */
    private String password;

    /**
     * Email
     */
    private String email;

    /**
     * Role: 1=admin, 2=marker
     */
    private Integer role;
}