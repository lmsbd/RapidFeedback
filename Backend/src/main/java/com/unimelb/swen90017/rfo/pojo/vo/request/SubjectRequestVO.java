package com.unimelb.swen90017.rfo.pojo.vo.request;

import com.unimelb.swen90017.rfo.pojo.vo.StudentResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.UserResponseVO;
import lombok.Data;

import java.util.List;

/**
 * Request VO for creating subject
 */
@Data
    public class SubjectRequestVO {
    /**
     * Subject ID
     */
    private Long id;

    /**
     * Subject name
     */
    private String name;

    /**
     * Subject description
     */
    private String description;

    /**
     * stdent list
     */
    private List<StudentResponseVO> students;

    /**
     * marker list
     */
    private List<Long> markerIds;
}


