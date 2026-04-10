package com.unimelb.swen90017.rfo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.unimelb.swen90017.rfo.common.BusinessException;
import com.unimelb.swen90017.rfo.dao.UserDao;
import com.unimelb.swen90017.rfo.pojo.constants.BaseConstants;
import com.unimelb.swen90017.rfo.pojo.po.UserPO;
import com.unimelb.swen90017.rfo.pojo.vo.UserProfileVO;
import com.unimelb.swen90017.rfo.pojo.vo.UserResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.LoginRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.RegisterRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.UpdatePasswordRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.AuthResponseVO;
import com.unimelb.swen90017.rfo.security.CustomUserDetails;
import com.unimelb.swen90017.rfo.service.UserService;
import com.unimelb.swen90017.rfo.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * User service implementation
 */
@Slf4j
@Service
public class UserServiceImpl extends ServiceImpl<UserDao, UserPO> implements UserService {

    @Autowired
    private UserDao userDao;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    public List<UserResponseVO> getAllMarkers() {
        log.info("Getting all markers");
        List<UserPO> userPOList = userDao.getAllMarkers();

        return userPOList.stream().map(userPO -> {
            UserResponseVO userResponseVO = new UserResponseVO();
            userResponseVO.setUserId(userPO.getId());
            userResponseVO.setRole(userPO.getRole());
            userResponseVO.setUserName(userPO.getUsername());
            return userResponseVO;
        }).collect(Collectors.toList());
    }

    @Override
    public AuthResponseVO login(LoginRequestVO loginRequest) {
        try {
            UserPO user = authenticateAndGetUser(loginRequest);
            String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole());
            return buildAuthResponse(token, user);
        } catch (AuthenticationException e) {
            throw new BusinessException("Incorrect email or password");
        }
    }

    private UserPO authenticateAndGetUser(LoginRequestVO request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        return ((CustomUserDetails) auth.getPrincipal()).getUser();
    }

    private AuthResponseVO buildAuthResponse(String token, UserPO user) {
        return AuthResponseVO.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void register(RegisterRequestVO request) {
        checkDuplicate(request);
        UserPO user = createUser(request);
        userDao.insert(user);
    }

    private void checkDuplicate(RegisterRequestVO request) {
        UserPO existing = userDao.selectByUsernameOrEmail(
                request.getUsername(),
                request.getEmail()
        );

        if (existing != null) {
            if (existing.getUsername().equals(request.getUsername())) {
                throw new BusinessException("Username already exists");
            }
            if (existing.getEmail() != null
                    && existing.getEmail().equals(request.getEmail())) {
                throw new BusinessException("Email address already exists.");
            }
        }
    }

    private UserPO createUser(RegisterRequestVO request) {
        return UserPO.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))  // 加密
                .email(request.getEmail())
                .role(Optional.ofNullable(request.getRole())
                        .orElse(BaseConstants.USER_ROLE_MARKER))
                .deleteStatus(BaseConstants.DELETE_STATUS_NOT_DELETED)
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserProfileVO updateProfile(Long userId, String username) {
        log.info("Updating profile for userId: {}", userId);

        if (!StringUtils.hasText(username)) {
            throw new BusinessException("Username cannot be empty");
        }

        UserPO user = userDao.selectById(userId);
        if (user == null || user.getDeleteStatus() == BaseConstants.DELETE_STATUS_DELETED) {
            throw new BusinessException("User not found");
        }

        checkUsernameDuplicate(userId, username);

        user.setUsername(username);
        userDao.updateById(user);

        return UserProfileVO.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .build();
    }

    private void checkUsernameDuplicate(Long currentUserId, String username) {
        LambdaQueryWrapper<UserPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.ne(UserPO::getId, currentUserId)
                .eq(UserPO::getDeleteStatus, BaseConstants.DELETE_STATUS_NOT_DELETED)
                .eq(UserPO::getUsername, username);

        if (userDao.selectCount(wrapper) > 0) {
            throw new BusinessException("Username already exists");
        }
    }

//    /**
//     * Validate and save the avatar file to disk.
//     * @return relative URL path to be stored in DB (e.g. /avatars/1_xxx.jpg)
//     */
//    private String saveAvatarFile(Long userId, MultipartFile file) {
//        // Validate content type
//        String contentType = file.getContentType();
//        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
//            throw new BusinessException("Invalid file type. Only JPG, PNG, GIF, WebP are allowed.");
//        }
//
//        // Validate size (Spring already enforces 2MB via multipart config, this is a belt-and-suspenders check)
//        if (file.getSize() > 2 * 1024 * 1024) {
//            throw new BusinessException("Avatar file size must not exceed 2MB.");
//        }
//
//        // Build a unique filename: userId_timestamp.ext
//        String originalFilename = file.getOriginalFilename();
//        String ext = (originalFilename != null && originalFilename.contains("."))
//                ? originalFilename.substring(originalFilename.lastIndexOf('.'))
//                : ".jpg";
//        String filename = userId + "_" + System.currentTimeMillis() + ext;
//
//        // Resolve the upload directory relative to the JVM startup directory (project root: Backend/).
//        // This avoids Tomcat's internal temp directory being used as the working directory.
//        File dir = new File(System.getProperty("user.dir"), avatarUploadPath);
//        if (!dir.exists()) {
//            dir.mkdirs();
//        }
//
//        // Write to disk
//        File dest = new File(dir, filename);
//        try {
//            file.transferTo(dest);
//        } catch (IOException e) {
//            log.error("Failed to save avatar file: {}", e.getMessage());
//            throw new BusinessException("Failed to save avatar file.");
//        }
//
//        return "/avatars/" + filename;
//    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updatePassword(UpdatePasswordRequestVO request) {
        log.info("Updating password for userId: {}", request.getUserId());

        // 1. Find user
        UserPO user = userDao.selectById(request.getUserId());
        if (user == null || BaseConstants.DELETE_STATUS_DELETED.equals(user.getDeleteStatus())) {
            throw new BusinessException("User not found");
        }

        // 2. Verify old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BusinessException("Incorrect old password");
        }

        // 3. Reject if new password is the same as old
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BusinessException("New password cannot be the same as the old password");
        }

        // 4. Encode new password and update
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userDao.updateById(user);

        log.info("Password updated successfully for userId: {}", request.getUserId());
    }
}