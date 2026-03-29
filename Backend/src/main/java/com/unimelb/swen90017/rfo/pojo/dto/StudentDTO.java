package com.unimelb.swen90017.rfo.pojo.dto;

import lombok.Data;

@Data
public class StudentDTO {
    /**
     * student id in database
     */
    private Long id;

    /**
     * studentId
     */
    private Long studentId;

    /**
     * email
     */
    private String email;

    /**
     * first name
     */
    private String firstName;

    /**
     * sur name
     */
    private String surname;
}
