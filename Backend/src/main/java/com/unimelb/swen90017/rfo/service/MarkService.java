package com.unimelb.swen90017.rfo.service;

import com.unimelb.swen90017.rfo.pojo.vo.GroupMarkResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.SaveGroupMarkRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.SaveMarkRequestVO;

/**
 * Mark service interface
 */
public interface MarkService {

    /**
     * Save or update a mark record for an individual student.
     * If the student belongs to a group in this project, the group's total_score
     * is automatically recalculated as the average of all group members' scores
     * (members without a score count as 0 — absent penalty).
     *
     * @param request projectId + studentId + per-criteria details; markerId resolved from JWT
     */
    void saveMark(SaveMarkRequestVO request);

    /**
     * Save or update group scores for every student in a group in one atomic transaction.
     * Each student's groupScore is saved directly to mark_record.group_score.
     * The group-level comment is saved to group_mark_record.comment.
     *
     * @param request projectId + groupId + comment + per-student groupScore list; markerId resolved from JWT
     * @throws IllegalArgumentException if any studentId in the request is not a member of the group
     */
    void saveGroupMark(SaveGroupMarkRequestVO request);

    /**
     * Get group mark result for a given project and group.
     * Returns comment from group_mark_record and per-student groupScore from mark_record.
     *
     * @param projectId project ID
     * @param groupId   group ID
     * @return GroupMarkResponseVO with comment and per-student scores; scores are null if not yet marked
     */
    GroupMarkResponseVO getGroupMark(Long projectId, Long groupId);
}
