package com.unimelb.swen90017.rfo.pojo.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("student")
public class StudentPO {

    /**
     * primary key
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * Student ID
     */
    private Long studentId;

    /**
     * email
     */
    private String email;

    /**
     * first name
     */
    private String firstName;

    /**
     * Student last name
     */
    private String surname;

    /**
     * Delete status: 1 is deleted, 0 is not deleted
     */
    private String deleteStatus;

}
