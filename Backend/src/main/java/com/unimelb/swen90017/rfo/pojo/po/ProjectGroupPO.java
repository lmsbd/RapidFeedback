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
@TableName("project_group")
public class ProjectGroupPO {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    /**
     * project ID
     */
    private Long projectId;
    /**
     * group name
     */
    private String groupName;
}
