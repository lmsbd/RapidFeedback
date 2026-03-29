package com.unimelb.swen90017.rfo.controller;

import com.unimelb.swen90017.rfo.common.Result;
import com.unimelb.swen90017.rfo.pojo.vo.request.LoginRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.RegisterRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.AuthResponseVO;
import com.unimelb.swen90017.rfo.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller
 */
@Slf4j
@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserService userService;

    /**
     * User login
     */
    @PostMapping("/login")
    public Result<AuthResponseVO> login(@RequestBody LoginRequestVO loginRequest) {
        log.info("Login request received for email: {}", loginRequest.getEmail());

        try {
            AuthResponseVO authResponse = userService.login(loginRequest);
            return Result.success(authResponse);
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * User registration
     */
    @PostMapping("/register")
    public Result<AuthResponseVO> register(@RequestBody RegisterRequestVO registerRequest) {
        log.info("Registration request received for user: {}", registerRequest.getUsername());

        try {
            userService.register(registerRequest);
            return Result.success();
        } catch (Exception e) {
            log.error("Registration error: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }
}