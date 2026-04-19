package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response VO for GET /api/finalMark/list.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinalMarkListResponseVO {

    private List<FinalMarkItemVO> items;
    private String projectType;
    private String projectName;
}
