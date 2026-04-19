package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * A single student row in the final mark list response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinalMarkItemVO {

    private Long studentId;
    private String firstName;
    private String surname;
    private String email;

    /** null for individual projects */
    private Long groupId;
    /** null for individual projects */
    private String groupName;

    private List<MarkerScoreVO> markerScores;

    private BigDecimal averageScore;

    /** Admin-set final score; null if not yet set */
    private BigDecimal finalScore;

    private Boolean isLocked;

    private Integer completedMarkers;
    private Integer totalAssignedMarkers;
}
