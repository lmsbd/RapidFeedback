package com.unimelb.swen90017.rfo.controller;

import com.unimelb.swen90017.rfo.common.Result;
import com.unimelb.swen90017.rfo.pojo.vo.FinalMarkListResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.LockFinalMarkRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.SaveFinalMarkRequestVO;
import com.unimelb.swen90017.rfo.service.FinalMarkService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Final mark controller
 */
@Slf4j
@RestController
@RequestMapping("/api/finalMark")
public class FinalMarkController {

    @Autowired
    private FinalMarkService finalMarkService;

    /**
     * Get the final mark list for a project.
     * Returns per-student rows with each marker's score, average, admin final score, and lock status.
     */
    @GetMapping("/list")
    public Result<FinalMarkListResponseVO> getFinalMarkList(@RequestParam Long projectId) {
        log.info("getFinalMarkList: projectId={}", projectId);
        FinalMarkListResponseVO result = finalMarkService.getFinalMarkList(projectId);
        return Result.success(result);
    }

    /**
     * Save or update the admin-set final score for a student or group.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/save")
    public Result<Void> saveFinalMark(@RequestBody SaveFinalMarkRequestVO request) {
        log.info("saveFinalMark: projectId={}, studentId={}, groupId={}",
                request.getProjectId(), request.getStudentId(), request.getGroupId());
        finalMarkService.saveFinalMark(request);
        return Result.success();
    }

    /**
     * Lock or unlock the final score for a student or group.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/lock")
    public Result<Void> lockFinalMark(@RequestBody LockFinalMarkRequestVO request) {
        log.info("lockFinalMark: projectId={}, studentId={}, groupId={}, isLocked={}",
                request.getProjectId(), request.getStudentId(),
                request.getGroupId(), request.getIsLocked());
        finalMarkService.lockFinalMark(request);
        return Result.success();
    }
}
