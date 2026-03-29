package com.unimelb.swen90017.rfo.controller;

import com.unimelb.swen90017.rfo.common.Result;
import com.unimelb.swen90017.rfo.pojo.vo.UserResponseVO;
import com.unimelb.swen90017.rfo.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * User controller
 */
@Slf4j
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/getAllMarkers")
    public Result<List<UserResponseVO>> getAllMarkers() {
        log.info("Get all markers");
        try {
            List<UserResponseVO> markers = userService.getAllMarkers();
            return Result.success(markers);
        } catch (Exception e) {
            log.error("Error getting all markers: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }
}