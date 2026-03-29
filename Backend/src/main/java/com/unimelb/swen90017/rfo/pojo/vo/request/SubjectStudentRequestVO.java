package com.unimelb.swen90017.rfo.pojo.vo.request;

import lombok.Data;

import java.util.List;

/**
 * Request VO for assigning students to subject
 */
@Data
public class SubjectStudentRequestVO {
    /**
     * Subject ID
     */
    private Long subjectId;

    /**
     * List of student IDs to be assigned to this subject
     */
    private List<Long> studentIds;
    
    /**
     * List of student details (for creating new students if they don't exist)
     */
    private List<StudentInfo> students;
    
    @Data
    public static class StudentInfo {
        private Long studentId;
        private String email;
        private String firstName;
        private String surname;
    }
}

