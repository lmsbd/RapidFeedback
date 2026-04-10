package com.unimelb.swen90017.rfo.controller;

import com.unimelb.swen90017.rfo.common.Result;
import com.unimelb.swen90017.rfo.pojo.vo.UserProfileVO;
import com.unimelb.swen90017.rfo.pojo.vo.UserResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.UpdatePasswordRequestVO;
import com.unimelb.swen90017.rfo.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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

    /**
     * Get all markers (users with role = 2)
     * @return List of user response VO
     */
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

    /**
     * Update user profile (username only)
     * POST /api/user/updateProfile
     * Content-Type: application/json
     *
     * @param body { userId, username }
     * @return Updated user profile information
     */
    @PostMapping("/updateProfile")
    public Result<UserProfileVO> updateProfile(@RequestBody UserProfileVO body) {
        log.info("Update profile request for userId: {}", body.getUserId());
        try {
            UserProfileVO profile = userService.updateProfile(body.getUserId(), body.getUsername());
            log.info("Successfully updated profile for userId: {}", body.getUserId());
            return Result.success(profile);
        } catch (Exception e) {
            log.error("Error updating profile for userId {}: {}", body.getUserId(), e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * Update user password
     * POST /api/user/updatePassword
     * Content-Type: application/json
     *
     * @param request contains userId, oldPassword, newPassword
     * @return success/failure code + message
     */
    @PostMapping("/updatePassword")
    public Result<Void> updatePassword(@RequestBody UpdatePasswordRequestVO request) {
        log.info("Update password request for userId: {}", request.getUserId());
        try {
            userService.updatePassword(request);
            log.info("Successfully updated password for userId: {}", request.getUserId());
            return Result.success(null);
        } catch (Exception e) {
            log.error("Error updating password for userId {}: {}", request.getUserId(), e.getMessage());
            return Result.error(e.getMessage());
        }
    }
}