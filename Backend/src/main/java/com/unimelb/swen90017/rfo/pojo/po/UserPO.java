package com.unimelb.swen90017.rfo.pojo.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User persistent object
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("user")
public class UserPO {

    /**
     * User ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * User name
     */
    private String username;

    /**
     * User password
     */
    private String password;

    /**
     * User email
     */
    private String email;

    /**
     * User role: 1=admin, 2=marker
     */
    private Integer role;

    /**
     * Delete status: 1=deleted, 0=not deleted
     */
    @TableField("delete_status")
    private Integer deleteStatus;

    /**
     * User avatar URL
     */
    private String avatar;

}