package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User profile response VO
 * Used for updateProfile API response (does NOT contain JWT token)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileVO {

    private Long userId;

    private String username;
}
