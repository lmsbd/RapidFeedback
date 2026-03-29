package com.unimelb.swen90017.rfo.pojo.vo.request;

import com.unimelb.swen90017.rfo.pojo.dto.AssessmentCriteriaDTO;
import com.unimelb.swen90017.rfo.pojo.dto.GroupDTO;
import lombok.Data;

import java.util.List;

/**
 * Request VO for creating project
 */
@Data
public class ProjectRequestVO {
    /**
     * Project name
     */
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
     * Project groups
     */
    //如果前端不传入group字段，默认gourp为null
    private List<GroupDTO> groups;

    /**
     * Project type: "individual" or "group"
     */
    private String projectType;

    /**
     * markerList
     */
    private List<Long> markerList;

}


