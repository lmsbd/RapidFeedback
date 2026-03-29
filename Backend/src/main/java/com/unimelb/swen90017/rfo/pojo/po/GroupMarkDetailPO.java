package com.unimelb.swen90017.rfo.pojo.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Group mark detail persistent object
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("group_mark_detail")
public class GroupMarkDetailPO {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private Long groupMarkRecordId;

    private Long criteriaId;

    private BigDecimal score;

    private String comment;

    /**
     * 0 = first mark, 1 = changed
     */
    private Integer status;
}
