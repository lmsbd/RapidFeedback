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
@TableName("group_student")
public class GroupStudentPO {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * Student ID
     */
    private long studentId;

    /**
     * Group ID
     */
    private long groupId;


}