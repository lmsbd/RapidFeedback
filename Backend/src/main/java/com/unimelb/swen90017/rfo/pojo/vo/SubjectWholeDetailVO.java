package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.Data;
import java.util.List;

/**
 * Full subject detail including students and markers
 */
@Data
public class SubjectWholeDetailVO {

    private Long id;

    private String name;

    private String description;

    private List<StudentResponseVO> students;

    private List<UserResponseVO> markers;
}
