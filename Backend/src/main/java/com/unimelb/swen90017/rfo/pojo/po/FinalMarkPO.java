package com.unimelb.swen90017.rfo.pojo.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Final mark persistent object — stores admin-set final scores and lock status.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("final_mark")
public class FinalMarkPO {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private Long projectId;

    /** student.id (PK) for individual projects; null for group projects */
    private Long studentId;

    /** project_group.id for group projects; null for individual projects */
    private Long groupId;

    private BigDecimal finalScore;

    @TableField("is_locked")
    private Boolean isLocked;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
