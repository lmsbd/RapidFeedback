package com.unimelb.swen90017.rfo.pojo.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@TableName("student_project")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProjectPO {
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
     * Subject ID
     */
    private Long subjectId;
    /**
     * Project ID
     */
    private Long projectId;

}
