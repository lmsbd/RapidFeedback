package com.unimelb.swen90017.rfo.pojo.vo.request;

import com.unimelb.swen90017.rfo.pojo.dto.MarkDetailDTO;
import lombok.Data;

import java.util.List;

/**
 * Request VO for saving a mark record
 */
@Data
public class SaveMarkRequestVO {

    /**
     * Project ID
     */
    private Long projectId;

    /**
     * Business student number
     */
    private Long studentId;

    /**
     * Per-criteria score entries
     */
    private List<MarkDetailDTO> details;
}