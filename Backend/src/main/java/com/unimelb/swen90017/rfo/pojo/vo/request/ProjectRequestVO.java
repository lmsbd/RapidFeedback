package com.unimelb.swen90017.rfo.pojo.vo.request;

import com.unimelb.swen90017.rfo.pojo.dto.AssessmentCriteriaDTO;
import com.unimelb.swen90017.rfo.pojo.dto.GroupDTO;
import com.unimelb.swen90017.rfo.pojo.dto.MarkerStudentDTO;
import lombok.Data;

import java.util.List;

/**
 * Request VO for creating project
 */
@Data
public class ProjectRequestVO {
    private Long projectId;

    private String name;

    /**
     * Project countdown
     */
    private Long countdown;

    /**
     * Subject ID
     */
    private Long subjectId;

    /**
     * Assessment criteria elements
     */
    private List<AssessmentCriteriaDTO> elements;

    /**
     * Project groups (group projects only)
     */
    private List<GroupDTO> groups;

    /**
     * Project type: "individual" or "group"
     */
    private String projectType;

    /**
     * All marker user.id for this project (written to user_project)
     */
    private List<Long> markerList;

    /**
     * Per-student marker assignments (individual projects only)
     * Each entry contains a studentId (student.id PK) and a list of markerIds
     */
    private List<MarkerStudentDTO> markerStudents;
}


