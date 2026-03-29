package com.unimelb.swen90017.rfo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.unimelb.swen90017.rfo.common.BusinessException;
import com.unimelb.swen90017.rfo.dao.GroupMarkDetailDao;
import com.unimelb.swen90017.rfo.dao.GroupMarkRecordDao;
import com.unimelb.swen90017.rfo.dao.MarkDetailDao;
import com.unimelb.swen90017.rfo.dao.MarkRecordDao;
import com.unimelb.swen90017.rfo.dao.StudentProjectDao;
import com.unimelb.swen90017.rfo.dao.SubjectDao;
import com.unimelb.swen90017.rfo.dao.ProjectDao;
import com.unimelb.swen90017.rfo.pojo.dto.AssessmentCriteriaDTO;
import com.unimelb.swen90017.rfo.pojo.dto.GroupDTO;
import com.unimelb.swen90017.rfo.pojo.po.*;
import com.unimelb.swen90017.rfo.pojo.vo.*;
import com.unimelb.swen90017.rfo.pojo.vo.GroupAssessmentScoresResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.ProjectRequestVO;
import com.unimelb.swen90017.rfo.service.ProjectService;
import com.unimelb.swen90017.rfo.pojo.vo.request.ProjectStudentListRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.StudentResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.GroupResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.GroupWithStudentResponseVO;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



/**
 * Project service implementation
 */
@Slf4j
@Service
public class ProjectServiceImpl extends ServiceImpl<ProjectDao, ProjectPO> implements ProjectService {

    @Autowired
    private ProjectDao projectDao;
    @Autowired
    private StudentProjectDao studentProjectDao;
    @Autowired
    private SubjectDao subjectDao;
    @Autowired
    private MarkRecordDao markRecordDao;
    @Autowired
    private MarkDetailDao markDetailDao;
    @Autowired
    private GroupMarkRecordDao groupMarkRecordDao;
    @Autowired
    private GroupMarkDetailDao groupMarkDetailDao;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void save(ProjectRequestVO projectRequestVO,Long userId){
        //1.存入template表
        TemplatePO templatePO = TemplatePO.builder()
                .templateName("default template")
                .creatorId(userId)
                .build();
        projectDao.insertTemplate(templatePO);
        //获取templateId
        Long templateId = templatePO.getId();

        //2.存入project表
        String projectType = projectRequestVO.getProjectType();
        if (projectType == null || projectType.isEmpty()) {
            projectType = "individual";
        }
        ProjectPO projectPO = ProjectPO.builder()
                .name(projectRequestVO.getName())
                .countdown(projectRequestVO.getCountdown())
                .subjectId(projectRequestVO.getSubjectId())
                .templateId(templateId)
                .projectType(projectType)
                .build();
        //插入project后返回project主键id
        projectDao.insert(projectPO);
        Long projectId = projectPO.getId();

        //3.存入assessment_criteria表
        for(AssessmentCriteriaDTO assessmentCriteriaDTO : projectRequestVO.getElements()) {
            AssessmentCriteriaPO assessmentCriteriaPO = AssessmentCriteriaPO.builder()
                    .templateId(templateId)
                    .elementId(assessmentCriteriaDTO.getElementId())
                    .weighting(assessmentCriteriaDTO.getWeighting())
                    .maximumMark(assessmentCriteriaDTO.getMaximumMark())
                    .markIncrements(assessmentCriteriaDTO.getMarkIncrements())
                    .build();
            projectDao.insertAssessmentCriteria(assessmentCriteriaPO);
        }
        //存入marker
        List<Long> markerList = projectRequestVO.getMarkerList();
        for (Long markerId : markerList) {
            projectDao.insertUserProject(markerId, projectRequestVO.getSubjectId(), projectId);
        }

        //4.判断是individual还是group
        if (projectType.equals("individual")) {
            //直接存到student_project表
            List<Long> studentIds = subjectDao.getStudentIdsBySubjectId(projectRequestVO.getSubjectId());
            if (studentIds == null || studentIds.isEmpty()){
                throw new RuntimeException("StudentIds is empty");
            }
            for (Long studentId : studentIds) {
                StudentProjectPO sp = StudentProjectPO.builder()
                        .studentId(studentId)
                        .subjectId(projectRequestVO.getSubjectId())
                        .projectId(projectId)
                        .build();
                studentProjectDao.insert(sp);
            }
        } else if (projectType.equals("group")) {
            for (GroupDTO groupDTO : projectRequestVO.getGroups()) {
                ProjectGroupPO projectGroupPO = ProjectGroupPO.builder()
                        .projectId(projectId)
                        .groupName(groupDTO.getGroupName())
                        .build();
                projectDao.insertProjectGroup(projectGroupPO);
                //获取groupId
                Long groupId = projectGroupPO.getId();
                //5.存入group_student表和student_project表
                for (Long studentId : groupDTO.getStudentIds()) {
                    GroupStudentPO groupStudentPO = GroupStudentPO.builder()
                            .groupId(groupId)
                            .studentId(studentId)
                            .build();
                    projectDao.insertGroupStudent(groupStudentPO);
                    StudentProjectPO studentProjectPO = StudentProjectPO.builder()
                            .studentId(studentId)
                            .subjectId(projectRequestVO.getSubjectId())
                            .projectId(projectId)
                            .build();
                    studentProjectDao.insert(studentProjectPO);
                }
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteProject(Long projectId) {
        try {
            Long templateId = projectDao.getTemplateIdByProjectId(projectId);
            projectDao.deleteTemplate(templateId);
            projectDao.deleteAssessmentCriteria(templateId);
            projectDao.deleteStudentProject(projectId);
            projectDao.deleteUserProject(projectId);
            //查询project_group表中的Id，返回的是一个list，有多个id
            List<Long> GroupId = projectDao.getGroupIdByProjectId(projectId);
            projectDao.deleteProjectGroup(projectId);
            for(Long groupId : GroupId) {
                projectDao.deleteGroupStudent(groupId);
            }
            projectDao.deleteProject(projectId);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @Override
    public ProjectResponseVO getProjectById(Long projectId){
        ProjectPO projectPO = this.baseMapper.selectById(projectId);
        return convertToVO(projectPO);
    }

    @Override
    public ProjectDetailResponseVO getProjectDetail(Long projectId) {
        ProjectPO projectPO = this.baseMapper.selectById(projectId);
        if (projectPO == null) {
            return null;
        }
        ProjectDetailResponseVO vo = new ProjectDetailResponseVO();
        vo.setProjectId(projectPO.getId());
        vo.setProjectName(projectPO.getName());
        vo.setProjectType(projectPO.getProjectType() != null ? projectPO.getProjectType() : "individual");

        // description: [{ countdown, assessment[] }]
        Long templateId = projectDao.getTemplateIdByProjectId(projectId);
        List<AssessmentVO> assessmentList = templateId != null ? projectDao.getAssessmentByTemplateId(templateId) : Collections.emptyList();
        DescriptionItemVO descItem = new DescriptionItemVO();
        descItem.setCountdown(projectPO.getCountdown());
        descItem.setAssessment(assessmentList);
        vo.setDescription(Collections.singletonList(descItem));

        // markers
        vo.setMarkers(projectDao.getMarkersByProjectId(projectId));

        if ("group".equalsIgnoreCase(vo.getProjectType())) {
            try {
                vo.setTeams(getGroupsDetailByProjectId(projectId));
            } catch (Exception e) {
                log.warn("Failed to load teams for project {}", projectId, e);
                vo.setTeams(Collections.emptyList());
            }
        } else {
            vo.setStudents(projectDao.getStudentsByProjectId(projectId));
        }
        return vo;
    }

    @Override
    public List<ProjectResponseVO> getProjectsBySubjectId(Long subjectId){

        List<ProjectPO> projectPOList = this.baseMapper.getProjectsBySubjectId(subjectId);

        if(projectPOList == null || projectPOList.isEmpty()){
            return Collections.emptyList();
        }

        List<ProjectResponseVO> VOResult = new ArrayList<>();

        for(ProjectPO projectPO : projectPOList){
            ProjectResponseVO projectResponseVO = convertToVO(projectPO);
            VOResult.add(projectResponseVO);
        }
        return VOResult;
    }

    @Override
    public List<ProjectResponseVO> getProjectsBySubjectIdAndMarkerId(Long subjectId, Long markerId){

        List<ProjectPO> projectPOList = this.baseMapper.getProjectsBySubjectIdAndMarkerId(subjectId, markerId);

        if(projectPOList == null || projectPOList.isEmpty()){
            return Collections.emptyList();
        }

        List<ProjectResponseVO> VOResult = new ArrayList<>();

        for(ProjectPO projectPO : projectPOList){
            ProjectResponseVO projectResponseVO = convertToVO(projectPO);
            VOResult.add(projectResponseVO);
        }
        return VOResult;
    }

    private ProjectResponseVO convertToVO(ProjectPO projectPO){
        ProjectResponseVO projectResponseVO = new ProjectResponseVO();
        BeanUtils.copyProperties(projectPO, projectResponseVO);
        return projectResponseVO;
    }

    @Override
    public List<GroupWithStudentResponseVO> getGroupsDetailByProjectId(Long projectId) throws Exception{
        try{
            // 1. get project group list by project id
            List<ProjectGroupPO> projectGroupPOList = projectDao.getProjectGroupByProjectId(projectId);
            List<GroupWithStudentResponseVO> groupWithStudentResponseVOList = new ArrayList<>();

            // 2. get group detail by project group list
            for(ProjectGroupPO projectGroupPO : projectGroupPOList){
                
                // 3. create group with student response vo
                GroupWithStudentResponseVO vo = new GroupWithStudentResponseVO();
                // 4. set group id and name in vo
                vo.setId(projectGroupPO.getId());
                vo.setName(projectGroupPO.getGroupName());

                // 5. get student list by group id
                List<StudentPO> studentPOList = projectDao.selectStudentsByGroupIdInProject(projectGroupPO.getId());
                List<StudentResponseVO> studentVOs = new ArrayList<>();
                // 6. convert student po to student vo
                for(StudentPO studentPO : studentPOList){
                    StudentResponseVO studentVO = new StudentResponseVO();
                    BeanUtils.copyProperties(studentPO, studentVO);
                    studentVOs.add(studentVO);
                }
                // 7. set student list of this group in this vo
                vo.setStudents(studentVOs);
                // 8. add current group to result list
                groupWithStudentResponseVOList.add(vo);
            }
            return groupWithStudentResponseVOList;
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception("Failed to get group detail by project id: " + e.getMessage(), e);
        }
    }

    @Override
    public List<StudentResponseVO> getUnmarkedStudentList(Long projectId) {
        log.info("Fetching UNMARKED student list via student_project, projectId={}", projectId);
        //TODO
        return projectDao.getUnmarkedStudentsByProjectId(projectId);
    }

    @Override
    public List<StudentResponseVO> getMarkedStudentList(Long projectId) {
        log.info("Fetching MARKED student list via student_project, projectId={}", projectId);
        //TODO
        return projectDao.getMarkedStudentsByProjectId(projectId);
    }

    @Override
    public List<GroupResponseVO> getUnmarkedGroupList(Long projectId) {
        log.info("Fetching UNMARKED group list via project_group, projectId={}", projectId);
        return projectDao.getUnmarkedGroupsByProjectId(projectId);
    }

    @Override
    public List<GroupResponseVO> getMarkedGroupList(Long projectId) {
        log.info("Fetching MARKED group list via project_group, projectId={}", projectId);
        return projectDao.getMarkedGroupsByProjectId(projectId);
    }

    @Override
    public StudentAssessmentScoresResponseVO getStudentAssessmentScores(Long projectId, Long studentId) {
        ProjectPO projectPO = this.baseMapper.selectById(projectId);
        if (projectPO == null) {
            throw new BusinessException(404, "Project not found");
        }

        Long templateId = projectDao.getTemplateIdByProjectId(projectId);
        List<AssessmentVO> assessmentList = templateId != null
                ? projectDao.getAssessmentByTemplateId(templateId)
                : Collections.emptyList();

        // 查询该学生是否有评分记录（studentId 为 student 表主键 student.id）
        MarkRecordPO markRecord = markRecordDao.getByProjectAndStudent(projectId, studentId);

        // 构建 criteriaId -> detail 映射，未评分则为空 map
        Map<Long, MarkDetailPO> detailMap = new HashMap<>();
        if (markRecord != null) {
            List<MarkDetailPO> details = markDetailDao.getByMarkRecordId(markRecord.getId());
            for (MarkDetailPO detail : details) {
                detailMap.put(detail.getCriteriaId(), detail);
            }
        }

        List<AssessmentScoreItemVO> scoreItems = new ArrayList<>();
        for (AssessmentVO a : assessmentList) {
            MarkDetailPO detail = detailMap.get(a.getCriteriaId());
            AssessmentScoreItemVO item = AssessmentScoreItemVO.builder()
                    .criteriaId(a.getCriteriaId())
                    .name(a.getName())
                    .weighting(a.getWeighting())
                    .maxMark(a.getMaxMark())
                    .markIncrements(a.getMarkIncrements())
                    .score(detail != null ? detail.getScore() : null)
                    .comment(detail != null ? detail.getComment() : null)
                    .build();
            scoreItems.add(item);
        }

        DescriptionWithScoreVO descWithScore = DescriptionWithScoreVO.builder()
                .countdown(projectPO.getCountdown())
                .assessment(scoreItems)
                .build();

        return StudentAssessmentScoresResponseVO.builder()
                .projectId(projectPO.getId())
                .projectName(projectPO.getName())
                .projectType(projectPO.getProjectType() != null ? projectPO.getProjectType() : "individual")
                .description(Collections.singletonList(descWithScore))
                .build();
    }

    @Override
    public GroupAssessmentScoresResponseVO getGroupAssessmentScores(Long projectId, Long groupId) {
        ProjectPO projectPO = this.baseMapper.selectById(projectId);
        if (projectPO == null) {
            throw new BusinessException(404, "Project not found");
        }

        ProjectGroupPO groupPO = projectDao.getGroupById(groupId);
        if (groupPO == null) {
            throw new BusinessException(404, "Group not found");
        }

        Long templateId = projectDao.getTemplateIdByProjectId(projectId);
        List<AssessmentVO> assessmentList = templateId != null
                ? projectDao.getAssessmentByTemplateId(templateId)
                : Collections.emptyList();

        // 查询该小组是否有评分记录
        GroupMarkRecordPO groupMarkRecord = groupMarkRecordDao.getByProjectAndGroup(projectId, groupId);

        // 构建 criteriaId -> detail 映射，未评分则为空 map
        Map<Long, GroupMarkDetailPO> detailMap = new HashMap<>();
        if (groupMarkRecord != null) {
            List<GroupMarkDetailPO> details = groupMarkDetailDao.getByGroupMarkRecordId(groupMarkRecord.getId());
            for (GroupMarkDetailPO detail : details) {
                detailMap.put(detail.getCriteriaId(), detail);
            }
        }

        List<AssessmentScoreItemVO> scoreItems = new ArrayList<>();
        for (AssessmentVO a : assessmentList) {
            GroupMarkDetailPO detail = detailMap.get(a.getCriteriaId());
            AssessmentScoreItemVO item = AssessmentScoreItemVO.builder()
                    .criteriaId(a.getCriteriaId())
                    .name(a.getName())
                    .weighting(a.getWeighting())
                    .maxMark(a.getMaxMark())
                    .markIncrements(a.getMarkIncrements())
                    .score(detail != null ? detail.getScore() : null)
                    .comment(detail != null ? detail.getComment() : null)
                    .build();
            scoreItems.add(item);
        }

        DescriptionWithScoreVO descWithScore = DescriptionWithScoreVO.builder()
                .countdown(projectPO.getCountdown())
                .assessment(scoreItems)
                .build();

        return GroupAssessmentScoresResponseVO.builder()
                .projectId(projectPO.getId())
                .projectName(projectPO.getName())
                .projectType(projectPO.getProjectType() != null ? projectPO.getProjectType() : "group")
                .groupId(groupPO.getId())
                .groupName(groupPO.getGroupName())
                .description(Collections.singletonList(descWithScore))
                .build();
    }


}
