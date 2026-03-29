package com.unimelb.swen90017.rfo.controller;

import com.unimelb.swen90017.rfo.common.Result;
import com.unimelb.swen90017.rfo.pojo.vo.StudentResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.StudentRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.SubjectRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.SubjectDetailVO;
import com.unimelb.swen90017.rfo.pojo.vo.SubjectWholeDetailVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.SubjectUserRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.UserRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.SubjectStudentRequestVO;
import com.unimelb.swen90017.rfo.security.CustomUserDetails;
import com.unimelb.swen90017.rfo.service.SubjectService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid; 
import java.util.List;

/**
 * Subject controller
 */
@Slf4j
@RestController
@RequestMapping("/api/subjects")
public class SubjectController {
    
    @Autowired
    private SubjectService subjectService;


    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/save")
    public Result save(
            @RequestBody SubjectRequestVO subjectRequestVO,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Save subject: {}, userId: {}", subjectRequestVO, userDetails.getUserId());
        try {
            Long userId = userDetails.getUserId();
            subjectService.save(subjectRequestVO, userId);
            return Result.success();
        } catch (Exception e) {
            log.error("Failed to save subject: {}", e.getMessage(), e);
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/getStudentList")
    public Result<List<StudentResponseVO>> getStudentList(@RequestBody StudentRequestVO studentRequestVO) {
        log.info("Get student list: {}", studentRequestVO);
        try {
            List<StudentResponseVO> studentList = subjectService.getStudentList(studentRequestVO);
            return Result.success(studentList);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error(e.getMessage());
        }

    }
    @PostMapping("/getSubjectIds")
    public Result<List<Long>> getSubjectIds(@RequestBody @Valid UserRequestVO requestVO) {
        log.info("Get subject IDs for user request: {}", requestVO);
        try {
            List<Long> ids = subjectService.getSubjectIds(requestVO);
            log.info("Retrieved subject IDs: {}", ids);
            return Result.success(ids);
        } catch (Exception e) {
            log.error("Failed to get subject IDs, error: {}", e.getMessage(), e);
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/getSubjectList")
    public Result<List<SubjectDetailVO>> getSubjectList(@RequestBody @Valid UserRequestVO requestVO) {
        log.info("Get subject list for user request: {}", requestVO);
        try {
            List<SubjectDetailVO> list = subjectService.getSubjectList(requestVO);
            log.info("Retrieved subject list: {}", list);
            return Result.success(list);
        } catch (Exception e) {
            log.error("Failed to get subject list, error: {}", e.getMessage(), e);
            return Result.error(e.getMessage());
        }
    }
    @GetMapping("/getSubjectsDetail")
    public Result<SubjectWholeDetailVO> getSubjectsDetail(@RequestParam Long subjectId) {
        log.info("Get subject full detail for subjectId: {}", subjectId);
        try {
            SubjectWholeDetailVO detail = subjectService.getSubjectsDetail(subjectId);
            return Result.success(detail);
        } catch (Exception e) {
            log.error("Failed to get subject detail, subjectId={}", subjectId, e);
            return Result.error(e.getMessage());
        }
    }
    @PostMapping("/updateSubjectsDetail")
    public Result updateSubjectsDetail(
            @RequestBody SubjectRequestVO subjectRequestVO,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Update subject detail: {}, userId: {}", subjectRequestVO, userDetails.getUserId());
        try {
            subjectService.updateSubjectsDetail(subjectRequestVO, userDetails.getUserId());
            return Result.success();
        } catch (Exception e) {
            log.error("Failed to update subject detail", e);
            return Result.error(e.getMessage());
        }
    }
}
