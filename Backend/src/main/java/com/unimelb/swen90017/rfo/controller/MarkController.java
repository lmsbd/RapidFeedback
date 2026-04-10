package com.unimelb.swen90017.rfo.controller;

import com.unimelb.swen90017.rfo.common.Result;
import com.unimelb.swen90017.rfo.pojo.vo.GroupMarkResponseVO;
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
     * Save or update a mark record for an individual student.
     * markerId is resolved from the JWT token — not from the request body.
     * If the student belongs to a group, the group's total_score is automatically
     * recalculated as the average of all group members' scores (absent = 0).
     */
    @PostMapping("/saveMark")
    public Result saveMark(@RequestBody SaveMarkRequestVO request) {
        log.info("saveMark: projectId={}, studentId={}", request.getProjectId(), request.getStudentId());
        markService.saveMark(request);
        return Result.success();
    }

    /**
     * Save or update mark records for all students in a group within one transaction.
     * Each student's groupScore is saved directly to mark_record.group_score.
     * The group-level comment is saved to group_mark_record.comment.
     * markerId is resolved from the JWT token — not from the request body.
     */
    @PostMapping("/saveGroupMark")
    public Result saveGroupMark(@RequestBody SaveGroupMarkRequestVO request) {
        log.info("saveGroupMark: projectId={}, groupId={}, students={}",
                request.getProjectId(), request.getGroupId(),
                request.getStudents() == null ? 0 : request.getStudents().size());
        markService.saveGroupMark(request);
        return Result.success();
    }

    /**
     * Get group mark result for a given project and group.
     * Returns the group comment and each member's groupScore.
     */
    @GetMapping("/getGroupMark")
    public Result<GroupMarkResponseVO> getGroupMark(
            @RequestParam Long projectId,
            @RequestParam Long groupId) {
        log.info("getGroupMark: projectId={}, groupId={}", projectId, groupId);
        GroupMarkResponseVO result = markService.getGroupMark(projectId, groupId);
        return Result.success(result);
    }
}
