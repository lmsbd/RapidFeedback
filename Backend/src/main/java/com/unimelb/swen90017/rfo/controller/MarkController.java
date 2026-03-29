package com.unimelb.swen90017.rfo.controller;

import com.unimelb.swen90017.rfo.common.Result;
import com.unimelb.swen90017.rfo.pojo.vo.request.SaveGroupMarkRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.SaveMarkRequestVO;
import com.unimelb.swen90017.rfo.service.MarkService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * Mark controller
 */
@Slf4j
@RestController
@RequestMapping("/api/mark")
public class MarkController {

    @Autowired
    private MarkService markService;

    /**
     * Save or submit a mark record for a student (API 19)
     */
    @PostMapping("/saveMark")
    public Result saveMark(@RequestBody SaveMarkRequestVO request) {
        log.info("Save mark: projectId={}, studentId={}", request.getProjectId(), request.getStudentId());
        markService.saveMark(request);
        return Result.success();
    }

    /**
     * Save or submit a mark record for a group
     */
    @PostMapping("/saveGroupMark")
    public Result saveGroupMark(@RequestBody SaveGroupMarkRequestVO request) {
        log.info("Save group mark: projectId={}, groupId={}", request.getProjectId(), request.getGroupId());
        markService.saveGroupMark(request);
        return Result.success();
    }
}