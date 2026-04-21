package com.unimelb.swen90017.rfo.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.unimelb.swen90017.rfo.pojo.po.FinalMarkPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * Final mark data access interface
 */
@Mapper
public interface FinalMarkDao extends BaseMapper<FinalMarkPO> {

    @Select("SELECT * FROM final_mark WHERE project_id = #{projectId} AND student_id = #{studentId} LIMIT 1")
    FinalMarkPO getByProjectAndStudent(@Param("projectId") Long projectId,
                                       @Param("studentId") Long studentId);

    @Select("SELECT * FROM final_mark WHERE project_id = #{projectId} AND group_id = #{groupId} LIMIT 1")
    FinalMarkPO getByProjectAndGroup(@Param("projectId") Long projectId,
                                     @Param("groupId") Long groupId);

    @Select("SELECT * FROM final_mark WHERE project_id = #{projectId} "
            + "AND student_id = #{studentId} AND group_id = #{groupId} LIMIT 1")
    FinalMarkPO getByProjectStudentAndGroup(@Param("projectId") Long projectId,
                                            @Param("studentId") Long studentId,
                                            @Param("groupId") Long groupId);

    @Select("SELECT COUNT(*) FROM mark_record " +
            "WHERE project_id = #{projectId} AND student_id = #{studentId} AND total_score IS NOT NULL")
    int countCompletedMarkersForStudent(@Param("projectId") Long projectId,
                                        @Param("studentId") Long studentId);

    @Select("""
        SELECT COUNT(DISTINCT mr.marker_id)
        FROM mark_record mr
        INNER JOIN group_student gs ON gs.student_id = mr.student_id
        WHERE mr.project_id = #{projectId}
          AND gs.group_id = #{groupId}
          AND mr.group_score IS NOT NULL
          AND (gs.delete_status = 0 OR gs.delete_status IS NULL)
        """)
    int countCompletedMarkersForGroup(@Param("projectId") Long projectId,
                                      @Param("groupId") Long groupId);

    @Select("SELECT COUNT(*) FROM marker_student WHERE project_id = #{projectId} AND student_id = #{studentId}")
    int countAssignedMarkersForStudent(@Param("projectId") Long projectId,
                                       @Param("studentId") Long studentId);

    @Select("SELECT COUNT(*) FROM marker_group WHERE project_id = #{projectId} AND group_id = #{groupId}")
    int countAssignedMarkersForGroup(@Param("projectId") Long projectId,
                                     @Param("groupId") Long groupId);
}
