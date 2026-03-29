package com.unimelb.swen90017.rfo.service;

import java.util.List;
import com.baomidou.mybatisplus.extension.service.IService;
import com.unimelb.swen90017.rfo.pojo.po.ProjectPO;
import com.unimelb.swen90017.rfo.pojo.vo.ProjectDetailResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.ProjectResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.GroupAssessmentScoresResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.GroupResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.StudentAssessmentScoresResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.ProjectRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.ProjectStudentListRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.GroupWithStudentResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.StudentResponseVO;



/**
 * project service interface
 */
public interface ProjectService extends IService<ProjectPO> {
    /**
     * Save project
     */
   public void save(ProjectRequestVO projectRequestVO,Long userId);
   /**
    * Get project by id (simple)
    */
   public ProjectResponseVO getProjectById(Long projectId);

   /**
    * Get project detail by id (description, students/teams, markers)
    */
   public ProjectDetailResponseVO getProjectDetail(Long projectId);

   /**
    * Get all projects under a subject (for admin)
    */
   public List<ProjectResponseVO> getProjectsBySubjectId(Long subjectId);

   /**
    * Get projects assigned to a specific marker under a subject
    */
   public List<ProjectResponseVO> getProjectsBySubjectIdAndMarkerId(Long subjectId, Long markerId);

   /**
    * Get groups detail by project id
    * @param projectId
    * @return
    * @throws Exception
    */
   public List<GroupWithStudentResponseVO> getGroupsDetailByProjectId(Long projectId) throws Exception;

   public List<StudentResponseVO> getUnmarkedStudentList(Long projectId);

   public List<StudentResponseVO> getMarkedStudentList(Long projectId);

   public List<GroupResponseVO> getUnmarkedGroupList(Long projectId);

   public List<GroupResponseVO> getMarkedGroupList(Long projectId);

   void deleteProject(Long projectId);

   /**
    * Get assessment criteria with scores for a specific student in a project.
    * studentId is the business student number (student.student_id).
    * score is null for each criterion if the student has not been graded.
    */
   StudentAssessmentScoresResponseVO getStudentAssessmentScores(Long projectId, Long studentId);

   /**
    * Get assessment criteria with scores for a specific group in a project.
    * score is null for each criterion if the group has not been graded.
    */
   GroupAssessmentScoresResponseVO getGroupAssessmentScores(Long projectId, Long groupId);
}
