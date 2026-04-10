package com.unimelb.swen90017.rfo.pojo.vo.request;

import com.unimelb.swen90017.rfo.pojo.dto.GroupStudentMarkDTO;
import lombok.Data;

import java.util.List;

/**
 * Request body for POST /api/mark/saveGroupMark.
 *
 * <p>The marker assigns a group score directly to each student and an optional
 * comment for the whole group. Each student's score is saved to
 * {@code mark_record.group_score}. The group comment is saved to
 * {@code group_mark_record.comment}.</p>
 */
@Data
public class SaveGroupMarkRequestVO {

    /**
     * Project ID
     */
    private Long projectId;

    /**
     * Group ID (project_group.id)
     */
    private Long groupId;

    /**
     * Overall comment for the whole group from the marker (optional)
     */
    private String comment;

    /**
     * Per-student score entries; each entry contains a studentId and their group score
     */
    private List<GroupStudentMarkDTO> students;
}
