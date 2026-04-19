package com.unimelb.swen90017.rfo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.unimelb.swen90017.rfo.common.BusinessException;
import com.unimelb.swen90017.rfo.pojo.constants.BaseConstants;
import com.unimelb.swen90017.rfo.dao.FinalMarkDao;
import com.unimelb.swen90017.rfo.dao.GroupMarkDetailDao;
import com.unimelb.swen90017.rfo.dao.GroupMarkRecordDao;
import com.unimelb.swen90017.rfo.dao.MarkDetailDao;
import com.unimelb.swen90017.rfo.dao.MarkRecordDao;
import com.unimelb.swen90017.rfo.dao.StudentDao;
import com.unimelb.swen90017.rfo.dao.StudentProjectDao;
import com.unimelb.swen90017.rfo.dao.ProjectDao;
import com.unimelb.swen90017.rfo.dao.UserDao;
import com.unimelb.swen90017.rfo.pojo.dto.AssessmentCriteriaDTO;
import com.unimelb.swen90017.rfo.pojo.dto.GroupDTO;
import com.unimelb.swen90017.rfo.pojo.dto.MarkerStudentDTO;
import com.unimelb.swen90017.rfo.pojo.po.*;
import com.unimelb.swen90017.rfo.pojo.vo.*;
import com.unimelb.swen90017.rfo.pojo.vo.GroupAssessmentScoresResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.ProjectRequestVO;
import com.unimelb.swen90017.rfo.service.EmailService;
import com.unimelb.swen90017.rfo.service.ProjectService;
import com.unimelb.swen90017.rfo.util.PdfReportGenerator;
import com.unimelb.swen90017.rfo.pojo.vo.request.ProjectStudentListRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.StudentResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.GroupResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.GroupWithStudentResponseVO;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
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
    private MarkRecordDao markRecordDao;
    @Autowired
    private MarkDetailDao markDetailDao;
    @Autowired
    private GroupMarkRecordDao groupMarkRecordDao;
    @Autowired
    private GroupMarkDetailDao groupMarkDetailDao;
    @Autowired
    private StudentDao studentDao;
    @Autowired
    private UserDao userDao;
    @Autowired
    private FinalMarkDao finalMarkDao;
    @Autowired
    private EmailService emailService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void save(ProjectRequestVO projectRequestVO, Long userId) {
        if (projectRequestVO.getProjectId() != null) {
            updateProject(projectRequestVO);
            return;
        }
        createProject(projectRequestVO, userId);
    }

    private void createProject(ProjectRequestVO projectRequestVO, Long userId) {
        TemplatePO templatePO = TemplatePO.builder()
                .templateName("default template")
                .creatorId(userId)
                .build();
        projectDao.insertTemplate(templatePO);
        Long templateId = templatePO.getId();

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
        projectDao.insert(projectPO);
        Long projectId = projectPO.getId();

        insertAssessmentCriteria(templateId, projectRequestVO.getElements());
        insertMarkers(projectId, projectRequestVO.getSubjectId(), projectRequestVO.getMarkerList());
        insertStudentsOrGroups(projectId, projectRequestVO.getSubjectId(), projectType, projectRequestVO);
    }

    private void updateProject(ProjectRequestVO projectRequestVO) {
        Long projectId = projectRequestVO.getProjectId();
        ProjectPO existingProject = this.baseMapper.selectById(projectId);
        if (existingProject == null) {
            throw new BusinessException(404, "Project not found");
        }

        boolean hasMarking = projectDao.countMarkRecordsByProjectId(projectId) > 0;

        if (hasMarking) {
            boolean hasRestrictedFields =
                    projectRequestVO.getCountdown() != null
                    || projectRequestVO.getMarkerList() != null
                    || projectRequestVO.getMarkerStudents() != null
                    || projectRequestVO.getGroups() != null
                    || projectRequestVO.getElements() != null;
            if (hasRestrictedFields) {
                throw new BusinessException(400, "Cannot modify project after marking has started");
            }
            projectDao.updateProjectName(projectId, projectRequestVO.getName());
            return;
        }

        // No marking yet — full edit: delete old associations and recreate
        Long templateId = projectDao.getTemplateIdByProjectId(projectId);
        String projectType = existingProject.getProjectType() != null ? existingProject.getProjectType() : "individual";

        // Delete old associations
        projectDao.deleteAssessmentCriteria(templateId);
        projectDao.deleteStudentProject(projectId);
        projectDao.deleteUserProject(projectId);
        projectDao.deleteMarkerStudent(projectId);
        projectDao.deleteMarkerGroup(projectId);
        List<Long> groupIds = projectDao.getGroupIdByProjectId(projectId);
        for (Long groupId : groupIds) {
            projectDao.deleteGroupStudent(groupId);
        }
        projectDao.deleteProjectGroup(projectId);

        // Update project basic info
        projectDao.updateProjectNameAndCountdown(projectId, projectRequestVO.getName(), projectRequestVO.getCountdown());

        // Recreate associations
        insertAssessmentCriteria(templateId, projectRequestVO.getElements());
        insertMarkers(projectId, existingProject.getSubjectId(), projectRequestVO.getMarkerList());
        insertStudentsOrGroups(projectId, existingProject.getSubjectId(), projectType, projectRequestVO);
    }

    private void insertAssessmentCriteria(Long templateId, List<AssessmentCriteriaDTO> elements) {
        for (AssessmentCriteriaDTO dto : elements) {
            AssessmentCriteriaPO po = AssessmentCriteriaPO.builder()
                    .templateId(templateId)
                    .elementId(dto.getElementId())
                    .weighting(dto.getWeighting())
                    .maximumMark(dto.getMaximumMark())
                    .markIncrements(dto.getMarkIncrements())
                    .build();
            projectDao.insertAssessmentCriteria(po);
        }
    }

    private void insertMarkers(Long projectId, Long subjectId, List<Long> markerList) {
        for (Long markerId : markerList) {
            projectDao.insertUserProject(markerId, subjectId, projectId);
        }
    }

    private void insertStudentsOrGroups(Long projectId, Long subjectId, String projectType, ProjectRequestVO req) {
        if ("individual".equals(projectType)) {
            List<MarkerStudentDTO> markerStudents = req.getMarkerStudents();
            if (markerStudents == null || markerStudents.isEmpty()) {
                throw new RuntimeException("markerStudents is required for individual projects");
            }
            for (MarkerStudentDTO ms : markerStudents) {
                StudentPO studentPO = studentDao.findByStudentId(ms.getStudentId());
                if (studentPO == null) {
                    throw new BusinessException(400, "Student not found with studentId: " + ms.getStudentId());
                }
                Long studentPk = studentPO.getId();
                StudentProjectPO sp = StudentProjectPO.builder()
                        .studentId(studentPk)
                        .subjectId(subjectId)
                        .projectId(projectId)
                        .build();
                studentProjectDao.insert(sp);
                if (ms.getMarkerIds() != null) {
                    for (Long markerId : ms.getMarkerIds()) {
                        projectDao.insertMarkerStudent(projectId, studentPk, markerId);
                    }
                }
            }
        } else if ("group".equals(projectType)) {
            for (GroupDTO groupDTO : req.getGroups()) {
                ProjectGroupPO projectGroupPO = ProjectGroupPO.builder()
                        .projectId(projectId)
                        .groupName(groupDTO.getGroupName())
                        .build();
                projectDao.insertProjectGroup(projectGroupPO);
                Long groupId = projectGroupPO.getId();
                if (groupDTO.getMarkerIds() != null) {
                    for (Long markerId : groupDTO.getMarkerIds()) {
                        projectDao.insertMarkerGroup(projectId, groupId, markerId);
                    }
                }
                for (Long rawStudentId : groupDTO.getStudentIds()) {
                    StudentPO studentPO = studentDao.findByStudentId(rawStudentId);
                    if (studentPO == null) {
                        throw new BusinessException(400, "Student not found with studentId: " + rawStudentId);
                    }
                    Long studentPk = studentPO.getId();
                    GroupStudentPO groupStudentPO = GroupStudentPO.builder()
                            .groupId(groupId)
                            .studentId(studentPk)
                            .build();
                    projectDao.insertGroupStudent(groupStudentPO);
                    StudentProjectPO studentProjectPO = StudentProjectPO.builder()
                            .studentId(studentPk)
                            .subjectId(subjectId)
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
            projectDao.deleteMarkerStudent(projectId);
            projectDao.deleteMarkerGroup(projectId);
            projectDao.deleteMarkDetailByProjectId(projectId);
            projectDao.deleteMarkRecordByProjectId(projectId);
            projectDao.deleteGroupMarkRecordByProjectId(projectId);
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
    public boolean hasMarkingStarted(Long projectId) {
        ProjectPO projectPO = this.baseMapper.selectById(projectId);
        if (projectPO == null) {
            throw new BusinessException(404, "Project not found");
        }
        return projectDao.countMarkRecordsByProjectId(projectId) > 0;
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
            List<StudentResponseVO> students = projectDao.getStudentsByProjectId(projectId);
            for (StudentResponseVO student : students) {
                student.setMarkers(projectDao.getMarkersByStudentAndProject(projectId, student.getId()));
            }
            vo.setStudents(students);
        }
        return vo;
    }

    @Override
    public List<ProjectResponseVO> getProjectsBySubjectId(Long subjectId, Long adminUserId){

        List<ProjectPO> projectPOList = this.baseMapper.getProjectsBySubjectId(subjectId);

        if(projectPOList == null || projectPOList.isEmpty()){
            return Collections.emptyList();
        }

        List<ProjectResponseVO> VOResult = new ArrayList<>();

        for(ProjectPO projectPO : projectPOList){
            VOResult.add(toVOWithCounts(projectPO, adminUserId, BaseConstants.USER_ROLE_ADMIN));
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
            VOResult.add(toVOWithCounts(projectPO, markerId, BaseConstants.USER_ROLE_MARKER));
        }
        return VOResult;
    }

    private ProjectResponseVO convertToVO(ProjectPO projectPO){
        ProjectResponseVO projectResponseVO = new ProjectResponseVO();
        BeanUtils.copyProperties(projectPO, projectResponseVO);
        return projectResponseVO;
    }

    /**
     * Build a ProjectResponseVO and inject markedCount / unmarkedCount according to
     * the viewer's role and the project type. Counts mirror the WHERE/EXISTS rules
     * used by getMarked/UnmarkedStudentList and getMarked/UnmarkedGroupList.
     */
    private ProjectResponseVO toVOWithCounts(ProjectPO po, Long userId, Integer role){
        ProjectResponseVO vo = convertToVO(po);
        String type = (po.getProjectType() != null && !po.getProjectType().isEmpty())
                ? po.getProjectType() : "individual";
        vo.setProjectType(type);

        boolean isMarker = BaseConstants.USER_ROLE_MARKER.equals(role);
        Long projectId = po.getId();
        int marked;
        int unmarked;
        if ("group".equalsIgnoreCase(type)) {
            marked   = isMarker ? projectDao.countMarkedGroupsByProjectIdAndMarker(projectId, userId)
                                : projectDao.countMarkedGroupsByProjectId(projectId);
            unmarked = isMarker ? projectDao.countUnmarkedGroupsByProjectIdAndMarker(projectId, userId)
                                : projectDao.countUnmarkedGroupsByProjectId(projectId);
        } else {
            marked   = isMarker ? projectDao.countMarkedStudentsByProjectIdAndMarker(projectId, userId)
                                : projectDao.countMarkedStudentsByProjectId(projectId, userId);
            unmarked = isMarker ? projectDao.countUnmarkedStudentsByProjectIdAndMarker(projectId, userId)
                                : projectDao.countUnmarkedStudentsByProjectId(projectId, userId);
        }
        vo.setMarkedCount(marked);
        vo.setUnmarkedCount(unmarked);
        return vo;
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
                // 8. set markers assigned to this group
                vo.setMarkers(projectDao.getMarkersByGroupAndProject(projectId, projectGroupPO.getId()));
                // 9. add current group to result list
                groupWithStudentResponseVOList.add(vo);
            }
            return groupWithStudentResponseVOList;
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception("Failed to get group detail by project id: " + e.getMessage(), e);
        }
    }

    @Override
    public List<StudentResponseVO> getUnmarkedStudentList(Long projectId, Long userId, Integer role) {
        log.info("Fetching UNMARKED student list, projectId={}, userId={}, role={}", projectId, userId, role);
        if (BaseConstants.USER_ROLE_MARKER.equals(role)) {
            return projectDao.getUnmarkedStudentsByProjectIdAndMarker(projectId, userId);
        }
        // Admin: show all project students that Admin themselves has not yet graded
        return projectDao.getUnmarkedStudentsByProjectId(projectId, userId);
    }

    @Override
    public List<StudentResponseVO> getMarkedStudentList(Long projectId, Long userId, Integer role) {
        log.info("Fetching MARKED student list, projectId={}, userId={}, role={}", projectId, userId, role);
        if (BaseConstants.USER_ROLE_MARKER.equals(role)) {
            return projectDao.getMarkedStudentsByProjectIdAndMarker(projectId, userId);
        }
        // Admin: only show students that Admin themselves has graded, with all markers' scores
        List<StudentResponseVO> students = projectDao.getMarkedStudentsByProjectId(projectId, userId);
        for (StudentResponseVO student : students) {
            student.setMarkerScores(projectDao.getMarkerScoresByProjectAndStudent(projectId, student.getId()));
        }
        return students;
    }

    @Override
    public List<GroupResponseVO> getUnmarkedGroupList(Long projectId, Long userId, Integer role) {
        log.info("Fetching UNMARKED group list, projectId={}, userId={}, role={}", projectId, userId, role);
        if (BaseConstants.USER_ROLE_MARKER.equals(role)) {
            return projectDao.getUnmarkedGroupsByProjectIdAndMarker(projectId, userId);
        }
        return projectDao.getUnmarkedGroupsByProjectId(projectId);
    }

    @Override
    public List<GroupResponseVO> getMarkedGroupList(Long projectId, Long userId, Integer role) {
        log.info("Fetching MARKED group list, projectId={}, userId={}, role={}", projectId, userId, role);
        if (BaseConstants.USER_ROLE_MARKER.equals(role)) {
            return projectDao.getMarkedGroupsByProjectIdAndMarker(projectId, userId);
        }
        List<GroupResponseVO> groups = projectDao.getMarkedGroupsByProjectId(projectId);
        for (GroupResponseVO group : groups) {
            group.setMarkerScores(projectDao.getMarkerScoresByProjectAndGroup(projectId, group.getId()));
        }
        return groups;
    }

    @Override
    public StudentAssessmentScoresResponseVO getStudentAssessmentScores(Long projectId, Long studentId, Long markerId) {
        ProjectPO projectPO = this.baseMapper.selectById(projectId);
        if (projectPO == null) {
            throw new BusinessException(404, "Project not found");
        }

        Long templateId = projectDao.getTemplateIdByProjectId(projectId);
        List<AssessmentVO> assessmentList = templateId != null
                ? projectDao.getAssessmentByTemplateId(templateId)
                : Collections.emptyList();

        // 查询当前用户（marker 或 admin）自己的评分记录
        MarkRecordPO markRecord = markRecordDao.getByProjectAndStudentAndMarker(projectId, studentId, markerId);

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

        // 查询该小组所有 marker 的组评语
        List<GroupMarkRecordPO> groupMarkRecords = groupMarkRecordDao.getAllByProjectAndGroup(projectId, groupId);
        List<GroupCommentVO> groupComments = new ArrayList<>();
        for (GroupMarkRecordPO rec : groupMarkRecords) {
            if (rec.getComment() == null || rec.getComment().isBlank()) continue;
            UserPO marker = rec.getMarkerId() != null ? userDao.selectById(rec.getMarkerId()) : null;
            groupComments.add(GroupCommentVO.builder()
                    .markerId(rec.getMarkerId())
                    .markerName(marker != null ? marker.getUsername() : null)
                    .comment(rec.getComment())
                    .build());
        }

        // Per-criteria detail map (group_mark_detail is currently unpopulated; kept for compatibility)
        Map<Long, GroupMarkDetailPO> detailMap = new HashMap<>();
        for (GroupMarkRecordPO rec : groupMarkRecords) {
            List<GroupMarkDetailPO> details = groupMarkDetailDao.getByGroupMarkRecordId(rec.getId());
            for (GroupMarkDetailPO detail : details) {
                detailMap.putIfAbsent(detail.getCriteriaId(), detail);
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
                .groupComments(groupComments)
                .description(Collections.singletonList(descWithScore))
                .build();
    }

    @Override
    public SendReportResponseVO sendReport(Long projectId) {
        ProjectPO project = this.baseMapper.selectById(projectId);
        if (project == null) {
            throw new BusinessException(404, "Project not found");
        }

        Long templateId = projectDao.getTemplateIdByProjectId(projectId);
        List<AssessmentVO> criteria = templateId != null
                ? projectDao.getAssessmentByTemplateId(templateId)
                : Collections.emptyList();

        int totalStudents;
        String projectType = project.getProjectType() != null ? project.getProjectType() : "individual";

        if ("group".equalsIgnoreCase(projectType)) {
            List<GroupMarkRecordPO> groupRecords = groupMarkRecordDao.getByProjectId(projectId);
            if (groupRecords == null || groupRecords.isEmpty()) {
                throw new BusinessException(400, "No marked groups found in this project");
            }
            // group_mark_record now has one row per marker → dedupe by groupId (preserve order).
            LinkedHashSet<Long> groupIds = new LinkedHashSet<>();
            for (GroupMarkRecordPO record : groupRecords) {
                if (record.getGroupId() != null) groupIds.add(record.getGroupId());
            }
            int count = 0;
            for (Long gid : groupIds) {
                List<StudentPO> members = projectDao.selectStudentsByGroupIdInProject(gid);
                count += members.size();
            }
            totalStudents = count;
            sendGroupReportsAsync(project, criteria, new ArrayList<>(groupIds));
        } else {
            List<MarkRecordPO> records = markRecordDao.getByProjectId(projectId);
            if (records == null || records.isEmpty()) {
                throw new BusinessException(400, "No marked students found in this project");
            }
            totalStudents = records.size();
            sendIndividualReportsAsync(project, criteria, records);
        }

        return SendReportResponseVO.builder()
                .totalStudents(totalStudents)
                .projectName(project.getName())
                .build();
    }

    @Async
    public void sendIndividualReportsAsync(ProjectPO project, List<AssessmentVO> criteria,
                                            List<MarkRecordPO> records) {
        List<UserPO> admins = userDao.getAllAdmins();
        Map<Long, UserPO> markerCache = new LinkedHashMap<>();
        List<PdfReportGenerator.IndividualSummaryRow> summaryRows = new ArrayList<>();
        List<BigDecimal> finalScores = new ArrayList<>();

        Map<Long, List<MarkRecordPO>> byStudent = new LinkedHashMap<>();
        for (MarkRecordPO r : records) {
            if (r.getStudentId() == null) continue;
            byStudent.computeIfAbsent(r.getStudentId(), k -> new ArrayList<>()).add(r);
        }

        for (Map.Entry<Long, List<MarkRecordPO>> entry : byStudent.entrySet()) {
            Long studentPk = entry.getKey();
            List<MarkRecordPO> studentRecords = entry.getValue();
            try {
                StudentPO student = studentDao.findById(studentPk);
                if (student == null || student.getEmail() == null) {
                    log.error("Student not found or no email for student pk={}", studentPk);
                    continue;
                }

                FinalMarkPO finalPO = finalMarkDao.getByProjectAndStudent(project.getId(), studentPk);
                if (finalPO == null || finalPO.getFinalScore() == null) {
                    log.error("Missing final_mark for student pk={} in project {}", studentPk, project.getId());
                    continue;
                }
                BigDecimal finalScore = finalPO.getFinalScore();

                List<PdfReportGenerator.MarkerBlock> markerBlocks = new ArrayList<>();
                Map<Long, List<BigDecimal>> criteriaScoresByMarker = new LinkedHashMap<>();
                LinkedHashSet<String> markerNames = new LinkedHashSet<>();

                for (MarkRecordPO record : studentRecords) {
                    List<MarkDetailPO> details;
                    try {
                        details = markDetailDao.getByMarkRecordId(record.getId());
                    } catch (Exception e) {
                        log.error("Failed to load details for mark_record id={}: {}", record.getId(), e.getMessage());
                        continue;
                    }
                    UserPO marker = null;
                    if (record.getMarkerId() != null) {
                        marker = markerCache.get(record.getMarkerId());
                        if (marker == null) {
                            marker = userDao.selectById(record.getMarkerId());
                            if (marker != null) markerCache.put(record.getMarkerId(), marker);
                        }
                    }
                    String markerName = marker != null ? marker.getUsername() : "-";
                    markerNames.add(markerName);
                    markerBlocks.add(new PdfReportGenerator.MarkerBlock(
                            markerName, record.getTotalScore(), details));

                    for (MarkDetailPO d : details) {
                        if (d.getScore() == null || d.getCriteriaId() == null) continue;
                        criteriaScoresByMarker
                                .computeIfAbsent(d.getCriteriaId(), k -> new ArrayList<>())
                                .add(d.getScore());
                    }
                }

                byte[] pdf = PdfReportGenerator.generateIndividualReport(
                        student, project, criteria, markerBlocks, finalScore);

                String studentLabel = student.getFirstName() + " " + student.getSurname();
                String filename = student.getFirstName() + "_" + student.getSurname() + "_Assessment_Report.pdf";
                String subject = "[RapidFeedback] Assessment Report — " + project.getName() + " — " + studentLabel;
                String studentBody = "Hi " + student.getFirstName() + ",\n\n"
                        + "Please find attached your assessment report for \"" + project.getName() + "\".\n\n"
                        + "Best regards,\nRapidFeedback";
                try {
                    emailService.sendWithAttachment(student.getEmail(), subject, studentBody, pdf, filename);
                } catch (Exception e) {
                    log.error("Failed to send report to student pk={}: {}", studentPk, e.getMessage());
                }

                Map<Long, BigDecimal> criteriaAvg = new HashMap<>();
                for (Map.Entry<Long, List<BigDecimal>> ce : criteriaScoresByMarker.entrySet()) {
                    List<BigDecimal> scores = ce.getValue();
                    if (scores.isEmpty()) continue;
                    BigDecimal sum = BigDecimal.ZERO;
                    for (BigDecimal s : scores) sum = sum.add(s);
                    criteriaAvg.put(ce.getKey(),
                            sum.divide(BigDecimal.valueOf(scores.size()), 2, RoundingMode.HALF_UP));
                }

                summaryRows.add(new PdfReportGenerator.IndividualSummaryRow(
                        studentLabel,
                        student.getStudentId() != null ? String.valueOf(student.getStudentId()) : null,
                        String.join(", ", markerNames),
                        finalScore,
                        criteriaAvg));
                finalScores.add(finalScore);
            } catch (Exception e) {
                log.error("Failed to send report to student pk={}: {}", studentPk, e.getMessage());
            }
        }

        BigDecimal projectAverageFinal = null;
        if (!finalScores.isEmpty()) {
            BigDecimal sum = BigDecimal.ZERO;
            for (BigDecimal s : finalScores) sum = sum.add(s);
            projectAverageFinal = sum.divide(BigDecimal.valueOf(finalScores.size()), 2, RoundingMode.HALF_UP);
        }

        sendProjectSummary(project, criteria, summaryRows, null, null,
                markerCache.values(), admins, false, projectAverageFinal);
        log.info("Finished sending individual reports for project {}", project.getId());
    }

    private void sendProjectSummary(ProjectPO project, List<AssessmentVO> criteria,
                                     List<PdfReportGenerator.IndividualSummaryRow> indivRows,
                                     List<PdfReportGenerator.GroupSummaryRowV2> groupRows,
                                     List<PdfReportGenerator.IndividualInGroupSummaryRow> studentInGroupRows,
                                     java.util.Collection<UserPO> markers,
                                     List<UserPO> admins,
                                     boolean isGroup,
                                     BigDecimal projectAverageFinalScore) {
        boolean hasData = isGroup ? (groupRows != null && !groupRows.isEmpty())
                                  : (indivRows != null && !indivRows.isEmpty());
        if (!hasData) return;

        byte[] summaryPdf;
        try {
            summaryPdf = isGroup
                    ? PdfReportGenerator.generateGroupProjectSummaryReport(
                            project, criteria, groupRows, studentInGroupRows, projectAverageFinalScore)
                    : PdfReportGenerator.generateIndividualProjectSummaryReport(
                            project, criteria, indivRows, projectAverageFinalScore);
        } catch (Exception e) {
            log.error("Failed to generate project summary for project {}: {}", project.getId(), e.getMessage());
            return;
        }

        String safeName = project.getName() != null ? project.getName().replaceAll("\\s+", "_") : "project";
        String summaryFilename = safeName + "_Summary_Report.pdf";
        String summarySubject = "[RapidFeedback] Project Summary Report — " + project.getName();
        String coverage = isGroup ? "all marked groups" : "all marked students";

        // Dedupe by email across marker + admin lists: the same address should only
        // receive one summary email (same user may be both marker and admin, and two
        // identical messages get collapsed by the mail client anyway).
        Set<String> sentEmails = new HashSet<>();
        if (markers != null) {
            for (UserPO marker : markers) {
                if (marker == null || marker.getEmail() == null) continue;
                if (!sentEmails.add(marker.getEmail().toLowerCase())) continue;
                String body = "Hi " + marker.getUsername() + ",\n\n"
                        + "Attached is the assessment summary for \"" + project.getName() + "\", "
                        + "covering " + coverage + " in the project.\n\n"
                        + "Best regards,\nRapidFeedback";
                try {
                    emailService.sendWithAttachment(marker.getEmail(), summarySubject, body, summaryPdf, summaryFilename);
                } catch (Exception e) {
                    log.error("Failed to send marker summary to {}: {}", marker.getEmail(), e.getMessage());
                }
            }
        }

        for (UserPO admin : admins) {
            if (admin.getEmail() == null) continue;
            if (!sentEmails.add(admin.getEmail().toLowerCase())) continue;
            String body = "Hi " + admin.getUsername() + ",\n\n"
                    + "Attached is the assessment summary for \"" + project.getName() + "\", "
                    + "covering " + coverage + " in the project.\n\n"
                    + "Best regards,\nRapidFeedback";
            try {
                emailService.sendWithAttachment(admin.getEmail(), summarySubject, body, summaryPdf, summaryFilename);
            } catch (Exception e) {
                log.error("Failed to send admin summary to {}: {}", admin.getEmail(), e.getMessage());
            }
        }
    }

    @Async
    public void sendGroupReportsAsync(ProjectPO project, List<AssessmentVO> criteria,
                                       List<Long> groupIds) {
        List<UserPO> admins = userDao.getAllAdmins();
        Map<Long, UserPO> markerCache = new LinkedHashMap<>();

        List<PdfReportGenerator.GroupSummaryRowV2> groupSummaryRows = new ArrayList<>();
        List<PdfReportGenerator.IndividualInGroupSummaryRow> studentSummaryRows = new ArrayList<>();
        List<BigDecimal> finalScores = new ArrayList<>();

        for (Long groupId : groupIds) {
            try {
                ProjectGroupPO group = projectDao.getGroupById(groupId);
                if (group == null) {
                    log.error("Group not found for groupId={}", groupId);
                    continue;
                }

                FinalMarkPO finalPO = finalMarkDao.getByProjectAndGroup(project.getId(), groupId);
                if (finalPO == null || finalPO.getFinalScore() == null) {
                    log.error("Missing final_mark for group id={} in project {}", groupId, project.getId());
                    continue;
                }
                BigDecimal finalScore = finalPO.getFinalScore();

                List<StudentPO> members = projectDao.selectStudentsByGroupIdInProject(groupId);
                BigDecimal groupTotalScore = groupMarkRecordDao.getGroupTotalScore(project.getId(), groupId);

                // All markers' group comments for this group
                List<GroupMarkRecordPO> groupRecords = groupMarkRecordDao.getAllByProjectAndGroup(project.getId(), groupId);
                List<GroupCommentVO> groupComments = new ArrayList<>();
                for (GroupMarkRecordPO rec : groupRecords) {
                    if (rec.getMarkerId() == null) continue;
                    UserPO marker = markerCache.get(rec.getMarkerId());
                    if (marker == null) {
                        marker = userDao.selectById(rec.getMarkerId());
                        if (marker != null) markerCache.put(rec.getMarkerId(), marker);
                    }
                    if (rec.getComment() == null || rec.getComment().isBlank()) continue;
                    groupComments.add(GroupCommentVO.builder()
                            .markerId(rec.getMarkerId())
                            .markerName(marker != null ? marker.getUsername() : null)
                            .comment(rec.getComment())
                            .build());
                }

                // All mark_record rows for this group (every member × every marker)
                List<MarkRecordPO> records;
                try {
                    records = markRecordDao.getByProjectAndGroup(project.getId(), groupId);
                } catch (Exception e) {
                    log.error("Failed to load mark_records for group id={}: {}", groupId, e.getMessage());
                    continue;
                }
                Map<Long, List<MarkRecordPO>> byStudent = new LinkedHashMap<>();
                for (MarkRecordPO r : records) {
                    if (r.getStudentId() == null) continue;
                    byStudent.computeIfAbsent(r.getStudentId(), k -> new ArrayList<>()).add(r);
                }

                // Group-level per-criteria score pool (all members × all markers)
                Map<Long, List<BigDecimal>> groupCriteriaPool = new LinkedHashMap<>();

                String subject = "[RapidFeedback] Group Assessment Report — " + project.getName() + " — " + group.getGroupName();

                for (StudentPO member : members) {
                    List<MarkRecordPO> studentRecords = byStudent.get(member.getId());
                    if (studentRecords == null || studentRecords.isEmpty()) {
                        log.error("No mark_record for student pk={} in group id={}", member.getId(), groupId);
                        continue;
                    }

                    List<PdfReportGenerator.MarkerIndividualBlock> markerBlocks = new ArrayList<>();
                    Map<Long, List<BigDecimal>> studentCriteriaPool = new LinkedHashMap<>();
                    List<BigDecimal> indivTotals = new ArrayList<>();
                    List<BigDecimal> groupScoresForStudent = new ArrayList<>();
                    LinkedHashSet<String> markerNames = new LinkedHashSet<>();

                    for (MarkRecordPO r : studentRecords) {
                        List<MarkDetailPO> details;
                        try {
                            details = markDetailDao.getByMarkRecordId(r.getId());
                        } catch (Exception e) {
                            log.error("Failed to load details for mark_record id={}: {}", r.getId(), e.getMessage());
                            continue;
                        }
                        UserPO marker = null;
                        if (r.getMarkerId() != null) {
                            marker = markerCache.get(r.getMarkerId());
                            if (marker == null) {
                                marker = userDao.selectById(r.getMarkerId());
                                if (marker != null) markerCache.put(r.getMarkerId(), marker);
                            }
                        }
                        String markerName = marker != null ? marker.getUsername() : "-";
                        markerNames.add(markerName);
                        markerBlocks.add(new PdfReportGenerator.MarkerIndividualBlock(
                                markerName, r.getTotalScore(), r.getGroupScore(), details));

                        if (r.getTotalScore() != null) indivTotals.add(r.getTotalScore());
                        if (r.getGroupScore() != null) groupScoresForStudent.add(r.getGroupScore());

                        for (MarkDetailPO d : details) {
                            if (d.getScore() == null || d.getCriteriaId() == null) continue;
                            studentCriteriaPool.computeIfAbsent(d.getCriteriaId(), k -> new ArrayList<>())
                                    .add(d.getScore());
                            groupCriteriaPool.computeIfAbsent(d.getCriteriaId(), k -> new ArrayList<>())
                                    .add(d.getScore());
                        }
                    }

                    if (member.getEmail() == null) {
                        log.error("No email for student pk={} in group {}", member.getId(), group.getGroupName());
                    } else {
                        try {
                            byte[] pdf = PdfReportGenerator.generateGroupReport(
                                    member, group, members, project, criteria,
                                    markerBlocks, groupTotalScore, groupComments, finalScore);
                            String filename = group.getGroupName().replaceAll("\\s+", "_")
                                    + "_" + member.getFirstName() + "_" + member.getSurname()
                                    + "_Assessment_Report.pdf";
                            String body = "Hi " + member.getFirstName() + ",\n\n"
                                    + "Please find attached your assessment report for \"" + project.getName() + "\".\n\n"
                                    + "Best regards,\nRapidFeedback";
                            emailService.sendWithAttachment(member.getEmail(), subject, body, pdf, filename);
                        } catch (Exception e) {
                            log.error("Failed to send group report to student pk={} ({}): {}",
                                    member.getId(), member.getEmail(), e.getMessage());
                        }
                    }

                    studentSummaryRows.add(new PdfReportGenerator.IndividualInGroupSummaryRow(
                            member.getFirstName() + " " + member.getSurname(),
                            member.getStudentId() != null ? String.valueOf(member.getStudentId()) : null,
                            group.getGroupName(),
                            String.join(", ", markerNames),
                            averageOf(indivTotals),
                            averageOf(groupScoresForStudent),
                            averageMap(studentCriteriaPool)));
                }

                groupSummaryRows.add(new PdfReportGenerator.GroupSummaryRowV2(
                        group.getGroupName(),
                        members.stream().map(s -> s.getFirstName() + " " + s.getSurname())
                                .collect(Collectors.joining(", ")),
                        finalScore,
                        groupTotalScore,
                        averageMap(groupCriteriaPool)));
                finalScores.add(finalScore);

                // Include markers who scored any member even if they did not write a group comment
                List<Long> mids = groupMarkRecordDao.getMarkerIdsByGroup(project.getId(), groupId);
                if (mids != null) {
                    for (Long mid : mids) {
                        if (mid == null || markerCache.containsKey(mid)) continue;
                        UserPO m = userDao.selectById(mid);
                        if (m != null) markerCache.put(mid, m);
                    }
                }
            } catch (Exception e) {
                log.error("Failed to process group report for groupId={}: {}", groupId, e.getMessage());
            }
        }

        BigDecimal projectAverageFinal = averageOf(finalScores);

        sendProjectSummary(project, criteria, null, groupSummaryRows, studentSummaryRows,
                markerCache.values(), admins, true, projectAverageFinal);
        log.info("Finished sending group reports for project {}", project.getId());
    }

    private static BigDecimal averageOf(List<BigDecimal> values) {
        if (values == null || values.isEmpty()) return null;
        BigDecimal sum = BigDecimal.ZERO;
        int count = 0;
        for (BigDecimal v : values) {
            if (v == null) continue;
            sum = sum.add(v);
            count++;
        }
        if (count == 0) return null;
        return sum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
    }

    private static Map<Long, BigDecimal> averageMap(Map<Long, List<BigDecimal>> pool) {
        Map<Long, BigDecimal> out = new HashMap<>();
        for (Map.Entry<Long, List<BigDecimal>> e : pool.entrySet()) {
            BigDecimal avg = averageOf(e.getValue());
            if (avg != null) out.put(e.getKey(), avg);
        }
        return out;
    }
}
