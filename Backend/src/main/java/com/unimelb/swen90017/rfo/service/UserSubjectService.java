package com.unimelb.swen90017.rfo.service;

import com.unimelb.swen90017.rfo.pojo.vo.SubjectDetailVO;

import java.util.List;

public interface UserSubjectService {
    List<Long> getSubjectIdsByUserId(Long userId);
    List<SubjectDetailVO> getSubjectDetailsByUserId(Long userId);
}
