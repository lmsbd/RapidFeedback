package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.Data;

import java.util.List;

/**
 * Description item (API: countdown + assessment[]).
 */
@Data
public class DescriptionItemVO {
    private Long countdown;
    private List<AssessmentVO> assessment;
}
