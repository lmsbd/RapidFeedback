package com.unimelb.swen90017.rfo.pojo.vo;

import com.unimelb.swen90017.rfo.pojo.dto.GroupStudentMarkDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response VO for GET /api/mark/getGroupMark.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMarkResponseVO {

    private Long projectId;

    private Long groupId;

    /**
     * Overall comment for the group from the marker; null if not yet marked
     */
    private String comment;

    /**
     * Per-student group scores; empty list if not yet marked
     */
    private List<GroupStudentMarkDTO> students;
}
