package com.unimelb.swen90017.rfo.pojo.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Subject persistent object
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("subject")
public class SubjectPO {
    
    /**
     * Subject ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * Subject name
     */
    private String name;
    
    /**
     * Subject description
     */
    private String description;

}
