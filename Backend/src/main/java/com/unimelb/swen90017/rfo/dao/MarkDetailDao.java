package com.unimelb.swen90017.rfo.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.unimelb.swen90017.rfo.pojo.po.MarkDetailPO;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * Mark detail data access interface
 */
@Mapper
public interface MarkDetailDao extends BaseMapper<MarkDetailPO> {

    @Insert("INSERT INTO mark_detail (mark_record_id, criteria_id, score, `comment`, status) " +
            "VALUES (#{markRecordId}, #{criteriaId}, #{score}, #{comment}, #{status})")
    void insertMarkDetail(MarkDetailPO markDetailPO);

    @Update("UPDATE mark_detail SET score=#{score}, `comment`=#{comment}, status=#{status} " +
            "WHERE mark_record_id=#{markRecordId} AND criteria_id=#{criteriaId}")
    void updateMarkDetail(MarkDetailPO markDetailPO);

    @Select("SELECT * FROM mark_detail WHERE mark_record_id=#{markRecordId} AND criteria_id=#{criteriaId}")
    MarkDetailPO getByCriteriaId(@Param("markRecordId") Long markRecordId, @Param("criteriaId") Long criteriaId);

    @Select("SELECT * FROM mark_detail WHERE mark_record_id = #{markRecordId}")
    List<MarkDetailPO> getByMarkRecordId(@Param("markRecordId") Long markRecordId);
}