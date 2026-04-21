package com.unimelb.swen90017.rfo.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.unimelb.swen90017.rfo.pojo.dto.GroupStudentMarkDTO;
import com.unimelb.swen90017.rfo.pojo.po.GroupMarkRecordPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.util.List;

/**
 * Group mark record data access interface
 */
@Mapper
public interface GroupMarkRecordDao extends BaseMapper<GroupMarkRecordPO> {

    /**
     * Return the single group_mark_record for a specific marker on a specific group.
     * Used by saveGroupComment (upsert) and getGroupMark (marker viewing their own draft).
     */
    @Select("SELECT * FROM group_mark_record " +
            "WHERE project_id = #{projectId} AND group_id = #{groupId} AND marker_id = #{markerId} LIMIT 1")
    GroupMarkRecordPO getByProjectGroupAndMarker(@Param("projectId") Long projectId,
                                                 @Param("groupId") Long groupId,
                                                 @Param("markerId") Long markerId);

    /**
     * Return all group_mark_record rows for a group (one per marker who wrote a comment).
     * Used by admin/summary views to display every marker's group comment.
     */
    @Select("SELECT * FROM group_mark_record " +
            "WHERE project_id = #{projectId} AND group_id = #{groupId}")
    List<GroupMarkRecordPO> getAllByProjectAndGroup(@Param("projectId") Long projectId,
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
            "LEFT JOIN mark_record mr ON mr.student_id = gs.student_id AND mr.project_id = #{projectId} AND mr.marker_id = #{markerId} " +
            "WHERE gs.group_id = #{groupId} AND (gs.delete_status = 0 OR gs.delete_status IS NULL)")
    List<GroupStudentMarkDTO> getStudentGroupScores(@Param("projectId") Long projectId,
                                                    @Param("groupId") Long groupId,
                                                    @Param("markerId") Long markerId);

    @Select("SELECT * FROM group_mark_record WHERE project_id = #{projectId}")
    List<GroupMarkRecordPO> getByProjectId(@Param("projectId") Long projectId);

    /**
     * Return distinct marker user ids who scored any member of this group in this project.
     */
    @Select("SELECT DISTINCT mr.marker_id FROM mark_record mr "
            + "JOIN group_student gs ON gs.student_id = mr.student_id "
            + "WHERE mr.project_id = #{projectId} "
            + "  AND gs.group_id = #{groupId} "
            + "  AND (gs.delete_status = 0 OR gs.delete_status IS NULL)")
    List<Long> getMarkerIdsByGroup(@Param("projectId") Long projectId,
                                   @Param("groupId") Long groupId);

    /**
     * Aggregate group total score: per-marker min group_score across group members, averaged over markers.
     * Mirrors the totalScore logic used by getMarkedGroupsByProjectId.
     */
    @Select("SELECT AVG(per_marker.score) "
            + "FROM ( "
            + "  SELECT MIN(mr.group_score) AS score "
            + "  FROM group_student gs "
            + "  JOIN mark_record mr ON mr.project_id = #{projectId} "
            + "                     AND mr.student_id = gs.student_id "
            + "  WHERE gs.group_id = #{groupId} "
            + "    AND mr.group_score IS NOT NULL "
            + "    AND (gs.delete_status = 0 OR gs.delete_status IS NULL) "
            + "  GROUP BY mr.marker_id "
            + ") AS per_marker")
    BigDecimal getGroupTotalScore(@Param("projectId") Long projectId,
                                  @Param("groupId") Long groupId);
}
