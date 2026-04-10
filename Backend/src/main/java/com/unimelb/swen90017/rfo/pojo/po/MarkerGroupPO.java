package com.unimelb.swen90017.rfo.pojo.po;

import com.baomidou.mybatisplus.annotation.IdType;
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
@TableName("marker_group")
public class MarkerGroupPO {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    private Long projectId;
    private Long groupId;
    private Long markerId;
}
