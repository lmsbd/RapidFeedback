package com.unimelb.swen90017.rfo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.unimelb.swen90017.rfo.common.BusinessException;
import com.unimelb.swen90017.rfo.dao.UserDao;
import com.unimelb.swen90017.rfo.pojo.constants.BaseConstants;
import com.unimelb.swen90017.rfo.pojo.po.UserPO;
import com.unimelb.swen90017.rfo.pojo.vo.UserResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.LoginRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.RegisterRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.AuthResponseVO;
import com.unimelb.swen90017.rfo.security.CustomUserDetails;
import com.unimelb.swen90017.rfo.service.UserService;
import com.unimelb.swen90017.rfo.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

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
}