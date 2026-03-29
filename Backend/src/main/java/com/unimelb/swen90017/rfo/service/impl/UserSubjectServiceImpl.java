package com.unimelb.swen90017.rfo.service.impl;

import com.unimelb.swen90017.rfo.dao.UserSubjectDao;
import com.unimelb.swen90017.rfo.service.UserSubjectService;
import com.unimelb.swen90017.rfo.pojo.vo.SubjectDetailVO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserSubjectServiceImpl implements UserSubjectService {

    private final UserSubjectDao userSubjectDao;

    public UserSubjectServiceImpl(UserSubjectDao userSubjectDao) {
        this.userSubjectDao = userSubjectDao;
    }

    @Override
    public List<Long> getSubjectIdsByUserId(Long userId) {
        return userSubjectDao.selectSubjectIdsByUserId(userId);
    }

    @Override
    public List<SubjectDetailVO> getSubjectDetailsByUserId(Long userId) {
        return userSubjectDao.selectSubjectDetailsByUserId(userId);
    }
}
