package com.unimelb.swen90017.rfo.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.unimelb.swen90017.rfo.pojo.po.GroupMarkRecordPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * Group mark record data access interface
 */
@Mapper
public interface GroupMarkRecordDao extends BaseMapper<GroupMarkRecordPO> {

    @Select("SELECT * FROM group_mark_record WHERE project_id = #{projectId} AND group_id = #{groupId} LIMIT 1")
    GroupMarkRecordPO getByProjectAndGroup(@Param("projectId") Long projectId,
                                           @Param("groupId") Long groupId);
}
