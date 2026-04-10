package com.unimelb.swen90017.rfo.controller;

import java.util.List;
import com.unimelb.swen90017.rfo.common.Result;
import com.unimelb.swen90017.rfo.pojo.vo.ProjectDetailResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.ProjectResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.ProjectRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.SubjectRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.StudentResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.TemplateElementVO;
import com.unimelb.swen90017.rfo.pojo.vo.GroupWithStudentResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.GroupAssessmentScoresResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.GroupResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.StudentAssessmentScoresResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.ProjectStudentListRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.GroupAssessmentScoresRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.StudentAssessmentScoresRequestVO;

import com.unimelb.swen90017.rfo.security.CustomUserDetails;
import com.unimelb.swen90017.rfo.pojo.constants.BaseConstants;
import com.unimelb.swen90017.rfo.service.ProjectService;
import com.unimelb.swen90017.rfo.service.CommentService;
import com.unimelb.swen90017.rfo.common.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Project controller
 */
@Slf4j
@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    
    @Autowired
    private ProjectService projectService;

    @Autowired
    private CommentService commentService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/save")
    public Result save(@RequestBody ProjectRequestVO projectRequestVO,@AuthenticationPrincipal CustomUserDetails userDetails){
        log.info("Save subject: {}",projectRequestVO);
        Long userId = userDetails.getUserId();
        try {
            projectService.save(projectRequestVO, userId);
            return Result.success();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{projectId}")
    public Result deleteProject(@PathVariable Long projectId){
        log.info("Delete project: {}", projectId);
        try {
            projectService.deleteProject(projectId);
            return Result.success();
        } catch (Exception e) {
            log.error("Error while deleting project: {}", projectId, e);
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/getProjectDetailById")
    public Result<ProjectResponseVO> getProjectDetailById(@RequestParam Long projectId){
        if(projectId == null){
            throw new BusinessException(400,"Project ID is required");
        }
        log.info("Get project by id: {}", projectId);
        ProjectResponseVO projectResponseVO = projectService.getProjectById(projectId);
        return Result.success(projectResponseVO);
    }

    @GetMapping("/getProjectDetail")
    public Result<ProjectDetailResponseVO> getProjectDetail(@RequestParam Long projectId){
        if(projectId == null){
            throw new BusinessException(400,"Project ID is required");
        }
        log.info("Get project detail by id: {}", projectId);
        ProjectDetailResponseVO vo = projectService.getProjectDetail(projectId);
        if (vo == null) {
            throw new BusinessException(404, "Project not found");
        }
        return Result.success(vo);
    }

    @GetMapping("/getTemplateElementsList")
    public Result<List<TemplateElementVO>> getTemplateElements(){
        log.info("Get template elements");
        try{
            List<TemplateElementVO> templateElementVOList = commentService.getTemplateElementList();
            return Result.success(templateElementVOList);
        }
        catch(Exception e){
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/getProjects")
    public Result<List<ProjectResponseVO>> getProjectList(@RequestParam String subjectId,
                                                          @AuthenticationPrincipal CustomUserDetails userDetails){
        Long id = Long.parseLong(subjectId);
        log.info("Get project list of subject: {}, user role: {}", id, userDetails.getRole());

        List<ProjectResponseVO> projectResponseVOList;
        if (BaseConstants.USER_ROLE_MARKER.equals(userDetails.getRole())) {
            projectResponseVOList = projectService.getProjectsBySubjectIdAndMarkerId(id, userDetails.getUserId());
        } else {
            projectResponseVOList = projectService.getProjectsBySubjectId(id);
        }
        return Result.success(projectResponseVOList);
    }

    @GetMapping("/getGroupsDetailByProjectId")
    public Result<List<GroupWithStudentResponseVO>> getGroupsDetailByProjectId(@RequestParam String projectId){
        try{
            Long id = Long.parseLong(projectId);
            log.info("Get groups detail by project id: {}",id);
            List<GroupWithStudentResponseVO> groupWithStudentResponseVOList = projectService.getGroupsDetailByProjectId(id);
            return Result.success(groupWithStudentResponseVOList);
        }
        catch(Exception e){
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/getUnmarkedStudentList")
    public Result<List<StudentResponseVO>> getUnmarkedStudentList(
        @RequestBody ProjectStudentListRequestVO projectStudentListRequestVO,
        @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (projectStudentListRequestVO == null || projectStudentListRequestVO.getProjectId() == null) {
            throw new BusinessException(400, "projectId is required");
        }
        log.info("Get unmarked student list for project: {}", projectStudentListRequestVO);
        try {
            List<StudentResponseVO> studentList = projectService.getUnmarkedStudentList(
                    projectStudentListRequestVO.getProjectId(),
                    userDetails.getUserId(),
                    userDetails.getRole());
            return Result.success(studentList);
        } catch (Exception e) {
            log.error("Error while getting unmarked student list for project: {}", projectStudentListRequestVO, e);
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/getMarkedStudentList")
    public Result<List<StudentResponseVO>> getMarkedStudentList(
            @RequestBody ProjectStudentListRequestVO projectStudentListRequestVO,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (projectStudentListRequestVO == null || projectStudentListRequestVO.getProjectId() == null) {
            throw new BusinessException(400, "projectId is required");
        }
        log.info("Get marked student list for project: {}", projectStudentListRequestVO);
        try {
            List<StudentResponseVO> studentList = projectService.getMarkedStudentList(
                    projectStudentListRequestVO.getProjectId(),
                    userDetails.getUserId(),
                    userDetails.getRole());
             return Result.success(studentList);
        } catch (Exception e) {
            log.error("Error while getting marked student list for project: {}", projectStudentListRequestVO, e);
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/getUnmarkedGroupList")
    public Result<List<GroupResponseVO>> getUnmarkedGroupList(
            @RequestBody ProjectStudentListRequestVO projectStudentListRequestVO,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (projectStudentListRequestVO == null || projectStudentListRequestVO.getProjectId() == null) {
            throw new BusinessException(400, "projectId is required");
        }
        log.info("Get unmarked group list for project: {}", projectStudentListRequestVO);
        try {
            List<GroupResponseVO> groupList = projectService.getUnmarkedGroupList(
                    projectStudentListRequestVO.getProjectId(),
                    userDetails.getUserId(),
                    userDetails.getRole());
            return Result.success(groupList);
        } catch (Exception e) {
            log.error("Error while getting unmarked group list for project: {}", projectStudentListRequestVO, e);
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/getMarkedGroupList")
    public Result<List<GroupResponseVO>> getMarkedGroupList(
            @RequestBody ProjectStudentListRequestVO projectStudentListRequestVO,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (projectStudentListRequestVO == null || projectStudentListRequestVO.getProjectId() == null) {
            throw new BusinessException(400, "projectId is required");
        }
        log.info("Get marked group list for project: {}", projectStudentListRequestVO);
        try {
            List<GroupResponseVO> groupList = projectService.getMarkedGroupList(
                    projectStudentListRequestVO.getProjectId(),
                    userDetails.getUserId(),
                    userDetails.getRole());
            return Result.success(groupList);
        } catch (Exception e) {
            log.error("Error while getting marked group list for project: {}", projectStudentListRequestVO, e);
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/getStudentAssessmentScores")
    public Result<StudentAssessmentScoresResponseVO> getStudentAssessmentScores(
            @RequestBody StudentAssessmentScoresRequestVO requestVO) {
        log.info("Get student assessment scores: {}", requestVO);
        if (requestVO.getProjectId() == null || requestVO.getStudentId() == null) {
            throw new BusinessException(400, "projectId and studentId are required");
        }
        StudentAssessmentScoresResponseVO vo = projectService.getStudentAssessmentScores(
                requestVO.getProjectId(), requestVO.getStudentId());
        return Result.success(vo);
    }

    @PostMapping("/getGroupAssessmentScores")
    public Result<GroupAssessmentScoresResponseVO> getGroupAssessmentScores(
            @RequestBody GroupAssessmentScoresRequestVO requestVO) {
        log.info("Get group assessment scores: {}", requestVO);
        if (requestVO.getProjectId() == null || requestVO.getGroupId() == null) {
            throw new BusinessException(400, "projectId and groupId are required");
        }
        GroupAssessmentScoresResponseVO vo = projectService.getGroupAssessmentScores(
                requestVO.getProjectId(), requestVO.getGroupId());
        return Result.success(vo);
    }

}
