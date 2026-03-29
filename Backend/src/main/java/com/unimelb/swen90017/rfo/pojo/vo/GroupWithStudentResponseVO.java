package com.unimelb.swen90017.rfo.pojo.vo;

import java.util.List;

import lombok.Data;

@Data
public class GroupWithStudentResponseVO {

    /**
     * Group ID
     */
    private Long id;

    /**
     * Group name
     */
    private String name;

    /**
     * Students
     */
    private List<StudentResponseVO> students;

    
}
