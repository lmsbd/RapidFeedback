package com.unimelb.swen90017.rfo.dao;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.unimelb.swen90017.rfo.pojo.po.UserPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * User data access interface
 */
@Mapper
public interface UserDao extends BaseMapper<UserPO> {

    /**
     * Get all markers (users with role = 2)
     * @return List of user PO with role = 2
     */
    @Select("SELECT id, username, role FROM user WHERE role = 2 AND delete_status = 0")
    List<UserPO> getAllMarkers();

    default UserPO selectByUsernameOrEmail(String username, String email) {
        LambdaQueryWrapper<UserPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserPO::getUsername, username);

        if (StringUtils.hasText(email)) {
            wrapper.or().eq(UserPO::getEmail, email);
        }

        return selectOne(wrapper);
    }
}