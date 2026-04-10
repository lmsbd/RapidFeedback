package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class GroupResponseVO {
    /**
     * group id in database
     */
    private Long id;

    /**
     * group name
     */
    private String name;

    /**
     * total score, only returned for marked groups
     */
    private BigDecimal totalScore;

    /**
     * per-marker scores, only populated for Admin role in getMarkedGroupList
     */
    private List<MarkerScoreVO> markerScores;
}
