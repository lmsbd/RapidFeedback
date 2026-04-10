package com.unimelb.swen90017.rfo.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.unimelb.swen90017.rfo.pojo.po.MarkRecordPO;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * Mark record data access interface
 */
@Mapper
public interface MarkRecordDao extends BaseMapper<MarkRecordPO> {

    @Select("SELECT * FROM mark_record WHERE project_id = #{projectId} AND student_id = #{studentId} LIMIT 1")
    MarkRecordPO getByProjectAndStudent(@Param("projectId") Long projectId, @Param("studentId") Long studentId);

    @Select("SELECT * FROM mark_record WHERE project_id = #{projectId}")
    List<MarkRecordPO> getByProjectId(@Param("projectId") Long projectId);

    @Select("SELECT weighting FROM assessment_criteria WHERE id = #{criteriaId}")
    Integer getWeightingByCriteriaId(@Param("criteriaId") Long criteriaId);

    @Select("SELECT maximum_mark FROM assessment_criteria WHERE id = #{criteriaId}")
    Integer getMaximumMarkByCriteriaId(@Param("criteriaId") Long criteriaId);

    /**
     * Find the group_id of the group this student belongs to within a project.
     * Returns null if the student is not in any group for this project.
     */
    @Select("SELECT gs.group_id FROM group_student gs " +
            "JOIN project_group pg ON gs.group_id = pg.id " +
            "WHERE gs.student_id = #{studentId} AND pg.project_id = #{projectId} " +
            "AND (gs.delete_status = 0 OR gs.delete_status IS NULL) " +
            "AND pg.delete_status = 0 LIMIT 1")
    Long getGroupIdByStudentAndProject(@Param("studentId") Long studentId,
                                       @Param("projectId") Long projectId);
}