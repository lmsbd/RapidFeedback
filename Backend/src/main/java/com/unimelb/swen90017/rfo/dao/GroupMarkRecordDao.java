package com.unimelb.swen90017.rfo.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.unimelb.swen90017.rfo.pojo.dto.GroupStudentMarkDTO;
import com.unimelb.swen90017.rfo.pojo.po.GroupMarkRecordPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * Group mark record data access interface
 */
@Mapper
public interface GroupMarkRecordDao extends BaseMapper<GroupMarkRecordPO> {

    @Select("SELECT * FROM group_mark_record WHERE project_id = #{projectId} AND group_id = #{groupId} LIMIT 1")
    GroupMarkRecordPO getByProjectAndGroup(@Param("projectId") Long projectId,
                                           @Param("groupId") Long groupId);

    /**
     * Return the list of student PKs (student.id) that belong to this group.
     * Used by saveGroupMark to validate that all submitted studentIds are members of the group.
     */
    @Select("SELECT student_id FROM group_student " +
            "WHERE group_id = #{groupId} AND (delete_status = 0 OR delete_status IS NULL)")
    List<Long> getStudentIdsByGroupId(@Param("groupId") Long groupId);

    /**
     * Return per-student group scores for all members of this group in a project.
     * Members without a mark_record (not yet marked) return groupScore = null.
     */
    @Select("SELECT gs.student_id AS studentId, mr.group_score AS groupScore " +
            "FROM group_student gs " +
            "LEFT JOIN mark_record mr ON mr.student_id = gs.student_id AND mr.project_id = #{projectId} " +
            "WHERE gs.group_id = #{groupId} AND (gs.delete_status = 0 OR gs.delete_status IS NULL)")
    List<GroupStudentMarkDTO> getStudentGroupScores(@Param("projectId") Long projectId,
                                                    @Param("groupId") Long groupId);
}
