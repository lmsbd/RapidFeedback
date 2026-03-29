package com.unimelb.swen90017.rfo.service;

import com.unimelb.swen90017.rfo.pojo.vo.request.SaveGroupMarkRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.SaveMarkRequestVO;

/**
 * Mark service interface
 */
public interface MarkService {

    /**
     * Save or submit a mark record for a student.
     */
    void saveMark(SaveMarkRequestVO request);

    /**
     * Save or submit a mark record for a group.
     * Scores are stored in group_mark_record/group_mark_detail and then
     * distributed to each student in the group via mark_record/mark_detail.
     */
    void saveGroupMark(SaveGroupMarkRequestVO request);
}