package com.unimelb.swen90017.rfo.pojo.vo.request;

import lombok.Data;

/**
 * Login request VO
 */
@Data
public class LoginRequestVO {

    /**
     * Email
     */
    private String email;

    /**
     * Password
     */
    private String password;
}