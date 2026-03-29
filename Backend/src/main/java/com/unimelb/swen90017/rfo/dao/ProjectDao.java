package com.unimelb.swen90017.rfo.dao;

import java.util.List;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.unimelb.swen90017.rfo.pojo.po.*;
import com.unimelb.swen90017.rfo.pojo.vo.AssessmentVO;
import com.unimelb.swen90017.rfo.pojo.vo.GroupResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.StudentResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.UserDetailVO;
import org.apache.ibatis.annotations.*;

/**
 * Subject data access interface
 */
@Mapper
public interface ProjectDao extends BaseMapper<ProjectPO> {

    @Select("SELECT p.id, p.project_name AS name, p.countdown, p.subject_id AS subjectId "
            + "FROM project p WHERE p.subject_id = #{subjectId} AND p.delete_status = 0")
    List<ProjectPO> getProjectsBySubjectId(@Param("subjectId") Long subjectId);

    @Select("""
    SELECT p.id, p.project_name AS name, p.countdown, p.subject_id AS subjectId
    FROM project p
    INNER JOIN user_project up ON p.id = up.project_id
    WHERE p.subject_id = #{subjectId}
      AND up.user_id = #{markerId}
      AND p.delete_status = 0
    """)
    List<ProjectPO> getProjectsBySubjectIdAndMarkerId(@Param("subjectId") Long subjectId,
                                                      @Param("markerId") Long markerId);

    // 查询组的学生列表
    @Select("SELECT DISTINCT s.* FROM student s "
            + "INNER JOIN group_student gs ON (s.student_id = gs.student_id OR s.id = gs.student_id) "
            + "WHERE gs.group_id = #{groupId} "
            + "AND (gs.delete_status = 0 OR gs.delete_status IS NULL) "
            + "AND s.delete_status = 0")
    List<StudentPO> selectStudentsByGroupIdInProject(@Param("groupId") Long groupId);

    @Select("""
    SELECT DISTINCT
      s.id AS id,
      s.student_id AS studentId,
      s.email AS email,
      s.first_name AS firstName,
      s.surname AS surname
    FROM student_project sp
    INNER JOIN student s ON s.id = sp.student_id
    WHERE sp.project_id = #{projectId}
      AND s.delete_status = 0
      AND (
        NOT EXISTS (
          SELECT 1
          FROM mark_record mr
          WHERE mr.project_id = sp.project_id
            AND mr.student_id = s.id
        )
        OR EXISTS (
          SELECT 1
          FROM mark_record mr
          WHERE mr.project_id = sp.project_id
            AND mr.student_id = s.id
            AND mr.total_score IS NULL
        )
      )
    ORDER BY s.id
      """)
    List<StudentResponseVO> getUnmarkedStudentsByProjectId(@Param("projectId") Long projectId);
    
    @Select("""
    SELECT DISTINCT
      s.id AS id,
      s.student_id AS studentId,
      s.email AS email,
      s.first_name AS firstName,
      s.surname AS surname,
      mr.total_score AS totalScore
    FROM student_project sp
    INNER JOIN student s ON s.id = sp.student_id
    INNER JOIN mark_record mr
      ON mr.project_id = sp.project_id
      AND mr.student_id = s.id
    WHERE sp.project_id = #{projectId}
      AND s.delete_status = 0
      AND mr.total_score IS NOT NULL
    ORDER BY s.id
      """)
    List<StudentResponseVO> getMarkedStudentsByProjectId(@Param("projectId") Long projectId);

    @Select("""
    SELECT DISTINCT
      pg.id AS id,
      pg.group_name AS name
    FROM project_group pg
    WHERE pg.project_id = #{projectId}
      AND pg.delete_status = 0
      AND NOT EXISTS (
        SELECT 1
        FROM group_mark_record gmr
        WHERE gmr.project_id = pg.project_id
          AND gmr.group_id = pg.id
      )
    ORDER BY pg.id
    """)
    List<GroupResponseVO> getUnmarkedGroupsByProjectId(@Param("projectId") Long projectId);

    @Select("""
    SELECT DISTINCT
      pg.id AS id,
      pg.group_name AS name,
      gmr.total_score AS totalScore
    FROM project_group pg
    INNER JOIN group_mark_record gmr
      ON gmr.project_id = pg.project_id
      AND gmr.group_id = pg.id
    WHERE pg.project_id = #{projectId}
      AND pg.delete_status = 0
    ORDER BY pg.id
    """)
    List<GroupResponseVO> getMarkedGroupsByProjectId(@Param("projectId") Long projectId);

    @Update("UPDATE project SET delete_status = 1 WHERE id = #{projectId}")
    void deleteProject(Long projectId);

    @Select("SELECT template_id FROM project WHERE id = #{projectId}")
    Long getTemplateIdByProjectId(Long projectId);

    @Update("UPDATE assessment_criteria SET delete_status = 1 WHERE template_id = #{templateId}")
    void deleteAssessmentCriteria(Long templateId);

    @Insert("INSERT INTO template (template_name, creator_id) VALUES (#{templateName}, #{creatorId})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    void insertTemplate(TemplatePO templatePO);

    @Update("UPDATE template SET delete_status = 1 WHERE id = #{templateId}")
    void deleteTemplate(Long templateId);

    @Insert("INSERT INTO project_group (group_name, project_id) VALUES (#{groupName}, #{projectId})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    void insertProjectGroup(ProjectGroupPO projectGroupPO);

    @Insert("INSERT INTO group_student (group_id, student_id) VALUES (#{groupId}, #{studentId})")
    void insertGroupStudent(GroupStudentPO groupStudentPO);

    @Insert("INSERT INTO assessment_criteria (template_id, template_element_id, weighting, maximum_mark, mark_increments) VALUES (#{templateId}, #{elementId}, #{weighting}, #{maximumMark}, #{markIncrements})")
    void insertAssessmentCriteria(AssessmentCriteriaPO assessmentCriteriaPO);

    @Select("SELECT id FROM project_group WHERE project_id = #{projectId}")
    List<Long> getGroupIdByProjectId(Long projectId);

    @Select("SELECT id, group_name FROM project_group WHERE project_id = #{projectId} AND delete_status = 0")
    List<ProjectGroupPO> getProjectGroupByProjectId(Long projectId);

    @Select("SELECT id, group_name, project_id FROM project_group WHERE id = #{groupId} AND delete_status = 0")
    ProjectGroupPO getGroupById(@Param("groupId") Long groupId);

    @Update("UPDATE project_group SET delete_status = 1 WHERE project_id = #{projectId}")
    void deleteProjectGroup(Long projectId);

    @Update("UPDATE group_student SET delete_status = 1 WHERE group_id = #{groupId}")
    void deleteGroupStudent(Long groupId);

    @Select("""
    SELECT ac.id AS criteriaId, te.name AS name, ac.weighting AS weighting, ac.maximum_mark AS maxMark, ac.mark_increments AS markIncrements
    FROM assessment_criteria ac
    JOIN template_element te ON ac.template_element_id = te.id
    WHERE ac.template_id = #{templateId} AND ac.delete_status = 0 AND te.delete_status = 0
    ORDER BY ac.id
    """)
    List<AssessmentVO> getAssessmentByTemplateId(@Param("templateId") Long templateId);

    @Select("""
    SELECT u.id AS id, u.username AS username, u.email AS email
    FROM user u
    INNER JOIN user_project up ON u.id = up.user_id
    WHERE up.project_id = #{projectId} AND u.role = 2 AND u.delete_status = 0
    """)
    List<UserDetailVO> getMarkersByProjectId(@Param("projectId") Long projectId);

    @Select("""
    SELECT s.id AS id, s.student_id AS studentId, s.email AS email, s.first_name AS firstName, s.surname AS surname
    FROM student_project sp
    INNER JOIN student s ON s.id = sp.student_id
    WHERE sp.project_id = #{projectId} AND s.delete_status = 0
    ORDER BY s.id
    """)
    List<StudentResponseVO> getStudentsByProjectId(@Param("projectId") Long projectId);
    //Delete student_project based on projectid
    @Delete("DELETE FROM student_project WHERE project_id = #{projectId}")
    void deleteStudentProject(@Param("projectId") Long projectId);

    //Delete the user_project based on the projectid
    @Delete("DELETE FROM user_project WHERE project_id = #{projectId}")
    void deleteUserProject(@Param("projectId") Long projectId);

    //Insert the user_project
    @Insert("INSERT INTO user_project (user_id, subject_id, project_id) VALUES (#{userId}, #{subjectId}, #{projectId})")
    void insertUserProject(@Param("userId") Long userId,
                           @Param("subjectId") Long subjectId,
                           @Param("projectId") Long projectId);
}
