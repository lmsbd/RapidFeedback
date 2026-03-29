package com.unimelb.swen90017.rfo.pojo.vo.request;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class UserRequestVO {
    @NotNull
    private Long userId;
}
