package com.unimelb.swen90017.rfo.pojo.vo;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * User detail VO for marker list (id, username as "name", email).
 */
@Data
public class UserDetailVO {
    /**
     * User ID
     */
    private Long id;

    /**
     * Username, serialized as "name" in JSON for Marker schema
     */
    @JsonProperty("name")
    private String username;

    /**
     * Email
     */
    private String email;
}
