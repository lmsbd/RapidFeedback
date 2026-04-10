package com.unimelb.swen90017.rfo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.unimelb.swen90017.rfo.pojo.po.UserPO;
import com.unimelb.swen90017.rfo.pojo.vo.UserProfileVO;
import com.unimelb.swen90017.rfo.pojo.vo.UserResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.LoginRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.RegisterRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.UpdatePasswordRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.AuthResponseVO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * User service interface
 */
public interface UserService extends IService<UserPO> {

    /**
     * Get all markers
     * @return List of user response VO with role = 2
     */
    List<UserResponseVO> getAllMarkers();

    /**
     * User login
     * @param loginRequest login request
     * @return authentication response with token
     */
    AuthResponseVO login(LoginRequestVO loginRequest);

    /**
     * User registration
     * @param registerRequest register request
     * @return authentication response with token
     */
    void register(RegisterRequestVO registerRequest);

    /**
     * Update user profile (username only; email and role are immutable)
     * @param userId   target user ID
     * @param username new username
     * @return updated user profile VO
     */
    UserProfileVO updateProfile(Long userId, String username);

    /**
     * Update user password
     * @param request contains userId, oldPassword, newPassword
     */
    void updatePassword(UpdatePasswordRequestVO request);
}