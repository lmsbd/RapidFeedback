package com.unimelb.swen90017.rfo.pojo.vo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MarkerScoreVO {
    private Long markerId;
    private String markerName;
    private BigDecimal score;
}
