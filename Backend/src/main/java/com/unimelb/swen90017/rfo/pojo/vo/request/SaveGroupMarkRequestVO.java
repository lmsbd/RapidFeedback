package com.unimelb.swen90017.rfo.pojo.vo.request;

import com.unimelb.swen90017.rfo.pojo.dto.MarkDetailDTO;
import lombok.Data;

import java.util.List;

/**
 * Request VO for saving a group mark record
 */
@Data
public class SaveGroupMarkRequestVO {

    /**
     * Project ID
     */
    private Long projectId;

    /**
     * Group ID (project_group.id)
     */
    private Long groupId;

    /**
     * Per-criteria score entries
     */
    private List<MarkDetailDTO> details;
}