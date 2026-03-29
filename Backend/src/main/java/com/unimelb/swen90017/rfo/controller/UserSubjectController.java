package com.unimelb.swen90017.rfo.controller;

import com.unimelb.swen90017.rfo.common.Result;
import com.unimelb.swen90017.rfo.service.UserSubjectService;
import com.unimelb.swen90017.rfo.pojo.vo.SubjectDetailVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users")
public class UserSubjectController {

    private final UserSubjectService userSubjectService;

    public UserSubjectController(UserSubjectService userSubjectService) {
        this.userSubjectService = userSubjectService;
    }

    @GetMapping("/{userId}/subjectIds")
    public Result<List<Long>> getSubjectIds(@PathVariable Long userId) {
        try {
            log.info("Get subject IDs for user: {}", userId);
            return Result.success(userSubjectService.getSubjectIdsByUserId(userId));
        } catch (Exception e) {
            log.error("Error getting subject IDs for user: {}", userId, e);
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/{userId}/subjects")
    public Result<List<SubjectDetailVO>> getSubjectDetails(@PathVariable Long userId) {
        try {
            log.info("Get subject details for user: {}", userId);
            return Result.success(userSubjectService.getSubjectDetailsByUserId(userId));
        } catch (Exception e) {
            log.error("Error getting subject details for user: {}", userId, e);
            return Result.error(e.getMessage());
        }
    }
}
