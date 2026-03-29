package com.unimelb.swen90017.rfo.security;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.unimelb.swen90017.rfo.dao.UserDao;
import com.unimelb.swen90017.rfo.pojo.constants.BaseConstants;
import com.unimelb.swen90017.rfo.pojo.po.UserPO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Custom UserDetailsService implementation
 */
@Slf4j
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserDao userDao;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.debug("Loading user by email: {}", email);

        LambdaQueryWrapper<UserPO> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserPO::getEmail, email)
                   .eq(UserPO::getDeleteStatus, BaseConstants.DELETE_STATUS_NOT_DELETED);

        UserPO user = userDao.selectOne(queryWrapper);

        if (user == null) {
            log.error("User not found with email: {}", email);
            throw new UsernameNotFoundException("User not found with email: " + email);
        }

        log.debug("User found with email: {}", email);
        return new CustomUserDetails(user);
    }
}