package com.unimelb.swen90017.rfo.service;

import com.unimelb.swen90017.rfo.pojo.vo.FinalMarkListResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.LockFinalMarkRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.SaveFinalMarkRequestVO;

/**
 * Final mark service interface
 */
public interface FinalMarkService {

    /**
     * Get the final mark list for a project.
     * Returns per-student rows with marker scores, average, admin final score, and lock status.
     *
     * @param projectId project ID
     * @return list response with items, projectType, and projectName
     */
    FinalMarkListResponseVO getFinalMarkList(Long projectId);

    /**
     * Save or update the admin-set final score for a student (individual project)
     * or a group (group project).
     *
     * @param request projectId + studentId or groupId + finalScore
     */
    void saveFinalMark(SaveFinalMarkRequestVO request);

    /**
     * Lock or unlock the final score for a student (individual project)
     * or a group (group project).
     *
     * @param request projectId + studentId or groupId + isLocked
     */
    void lockFinalMark(LockFinalMarkRequestVO request);
}
