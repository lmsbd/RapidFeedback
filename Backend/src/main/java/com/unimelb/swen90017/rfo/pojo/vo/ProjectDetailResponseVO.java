package com.unimelb.swen90017.rfo.pojo.vo;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;

/**
 * Response VO for getProjectDetail (individual: students; group: teams; both: markers).
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProjectDetailResponseVO {
    private Long projectId;
    private String projectName;
    private List<DescriptionItemVO> description;
    private String projectType;

    /** For individual project */
    private List<StudentResponseVO> students;

    /** For group project */
    private List<GroupWithStudentResponseVO> teams;

    /** Assigned markers (user id, username as name, email) */
    private List<UserDetailVO> markers;
}
