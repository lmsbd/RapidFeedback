package com.unimelb.swen90017.rfo.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.unimelb.swen90017.rfo.pojo.po.GroupMarkDetailPO;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * Group mark detail data access interface
 */
@Mapper
public interface GroupMarkDetailDao extends BaseMapper<GroupMarkDetailPO> {

    @Insert("INSERT INTO group_mark_detail (group_mark_record_id, criteria_id, score, comment, status) " +
            "VALUES (#{groupMarkRecordId}, #{criteriaId}, #{score}, #{comment}, #{status})")
    void insertGroupMarkDetail(GroupMarkDetailPO groupMarkDetailPO);

    @Update("UPDATE group_mark_detail SET score = #{score}, comment = #{comment}, status = #{status} " +
            "WHERE group_mark_record_id = #{groupMarkRecordId} AND criteria_id = #{criteriaId}")
    void updateGroupMarkDetail(GroupMarkDetailPO groupMarkDetailPO);

    @Select("SELECT * FROM group_mark_detail WHERE group_mark_record_id = #{groupMarkRecordId} AND criteria_id = #{criteriaId} LIMIT 1")
    GroupMarkDetailPO getByCriteriaId(@Param("groupMarkRecordId") Long groupMarkRecordId,
                                      @Param("criteriaId") Long criteriaId);

    @Select("SELECT * FROM group_mark_detail WHERE group_mark_record_id = #{groupMarkRecordId}")
    List<GroupMarkDetailPO> getByGroupMarkRecordId(@Param("groupMarkRecordId") Long groupMarkRecordId);
}
